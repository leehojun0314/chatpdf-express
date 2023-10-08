const formidable = require('formidable');
const uploadBlob_v2 = require('../../utils/azureBlob/uploadBlob_v2');
const updateConvStatusModel = require('../../model/updateConvStatusModel');
const insertDocument = require('../../model/insertDocument');
const PdfParse = require('pdf-parse');
const upsertParagraph_v2 = require('../../utils/pinecone/upsertParagraph_v2');
const insertParagraphs_v2 = require('../../model/insertParagraph_v2');
const selectConversation_single = require('../../model/selectConversation_single');
const selectConvIntId = require('../../model/selectConvIntId');
const fs = require('fs');

async function addFiles_v2(req, res) {
	const user = req.user;
	const userId = user.user_id;
	let fields, files, convStringId, convIntId;
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
	try {
		const formidableRes = await useFormidable(req);
		fields = formidableRes.fields;
		files = formidableRes.files;
		convStringId = fields.convStringId;
		console.log('add files :', files);
		if (!convStringId) {
			throw new Error('No conversation id is given');
		}
		convIntId = await selectConvIntId({ convStringId });
		const singleConv = await selectConversation_single({ convIntId, userId });
		if (!convIntId) {
			throw new Error('Invalid conversation id');
		}
		let fileCount = 0;
		for (let file in files) {
			fileCount++;
		}
		if (!fileCount) {
			throw new Error('No file is given');
		}
		console.log('single conv: ', singleConv);
		if (!singleConv) {
			throw new Error('Only owner of conversation can add file');
		}
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
		return;
	}

	try {
		//update conversation status
		await updateConvStatusModel({
			convIntId,
			status: 'analyzing',
			userId: userId,
		});

		let isError = { status: false, message: '' };
		for (let file of Object.values(files)) {
			isError = await processFile(file);
			if (isError.status) break;
		}
		if (isError.status) {
			throw new Error(isError.message);
		}

		//upload blob
		// let uploadResults = await uploadBlob_v2(files);
		console.log('uploaded files: ', files);
		let fileIndex = 0;
		for await (let file of Object.values(files)) {
			// const { fileUrl, buffer, originalFilename, fileSize } = uploadResult;
			const fileUrl = '';
			const buffer = await fs.promises.readFile(file.filepath);
			const originalFilename = file.originalFilename;
			const fileSize = file.size;
			let stringBeforeSent =
				JSON.stringify({
					message: `Uploading file: ${originalFilename}`,
					status: 'uploading',
					progress: `${Math.floor(
						(fileIndex / Object.values(files).length) * 100,
					)}`,
				}) + '#';
			console.log('string before sent: ', stringBeforeSent);
			res.write(stringBeforeSent);
			//insert document in mssql
			const insertDocumentResult = await insertDocument({
				documentName: originalFilename,
				documentUrl: fileUrl,
				documentSize: fileSize,
				convIntId,
			});
			const documentId = insertDocumentResult.recordset[0].document_id;
			console.log('documentid : ', documentId);
			const pages = [];
			const document = await PdfParse(buffer, {
				pagerender: pageRender(pages),
			});
			const paragraphs = [];
			for (let i = 0; i < pages.length; i++) {
				paragraphs.push({
					content:
						`(page : ${i + 1})` + escapeQuotation(pages[i]).toLowerCase(),
					// keywords: escapeQuotation(extracted[i].join(', ')),
					pageNumber: i + 1,
					convIntId,
					docuInfo: document.info,
					docuMeta: document.metadata,
					docuId: documentId,
					docuName: originalFilename,
				});
			}
			await upsertParagraph_v2({
				paragraphs,
				convIntId,
				docuId: documentId,
			});
			await insertParagraphs_v2({ paragraphs, convIntId, documentId });
			// Send progress update to client

			fileIndex++;
		}
		await updateConvStatusModel({
			convIntId,
			status: 'created',
			userId: userId,
		});
		res.write(JSON.stringify({ message: 'All files processed' }));
		res.end();
		// res.status(201).end()
	} catch (err) {
		console.log('error: ', err);
		// await updateConvStatusModel({
		// 	convIntId,
		// 	status: 'error',
		// 	userId,
		// });
		res.write(JSON.stringify({ message: err.message }));
		res.end();
		// res.status(500).send(err);
	}
}
function useFormidable(req) {
	const form = formidable();

	return new Promise((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				console.log('get field err: ', err);
				reject(err);
			} else {
				resolve({ fields, files });
			}
		});
	});
}
const processFile = async (file) => {
	try {
		const bufferData = await fs.promises.readFile(file.filepath);
		const pages = [];
		await PdfParse(bufferData, { pagerender: pageRender(pages) });
		const replacedTexts = pages.join('').replaceAll(' ', '');
		if (!replacedTexts.length) {
			throw new Error(
				`Couldn't extract text from the file ${file.originalFilename}`,
			);
		}
	} catch (err) {
		return { status: true, message: err.message };
	}

	return { status: false, message: '' };
};
function pageRender(pageArr) {
	return (pageData) => {
		let renderOptions = {
			normalizeWhitespace: true,
		};

		return pageData.getTextContent(renderOptions).then((textContent) => {
			const mappedText = textContent.items.map((item) => item.str).join(' ');
			pageArr.push(mappedText);
			return mappedText;
		});
	};
}
function escapeQuotation(str) {
	return str.replace(/'/g, "''");
}
module.exports = addFiles_v2;
