const PdfParse = require('pdf-parse');
const updateConvStatusModel = require('../../model/updateConvStatusModel');
const { v4: uuidv4 } = require('uuid');
const uploadBlob_v2 = require('../../utils/azureBlob/uploadBlob_v2');
const insertConv_v5 = require('../../model/insertConv_v5');
const insertDocument = require('../../model/insertDocument');
const upsertParagraph_v2 = require('../../utils/pinecone/upsertParagraph_v2');
const insertParagraphs_v2 = require('../../model/insertParagraph_v2');
const formidable = require('formidable');
const fs = require('fs');

async function createConversationV9(req, res) {
	const user = req.user;
	console.log('user: ', user);
	let convIntId;
	let convStringId = generateConvId();
	console.log('conv string id : ', convStringId);
	let userId = user.user_id;
	let uploadResults;
	try {
		const { fields, files } = await useFormidable(req);
		//check file extraction
		let isError = { status: false, message: '' };
		for (let file of Object.values(files)) {
			isError = await processFile(file);
			if (isError.status) break;
		}

		if (isError.status) {
			throw new Error(isError.message);
		}

		//upload blob
		uploadResults = await uploadBlob_v2(files);
		console.log('upload complete');

		//conversation 생성
		const conversationResult = await insertConv_v5({
			conversationName: fields.conversationName,
			userId,
			convStringId,
		});

		convIntId = conversationResult.recordset[0].id;
		res.status(201).send({
			message: 'conversation created',
			createdId: convIntId,
		});
	} catch (error) {
		console.log('catch error: ', error);
		console.log(error.message);
		if (convIntId) {
			await updateConvStatusModel({
				convIntId: convIntId,
				status: 'error',
				userId: userId,
			});
		}

		res.status(500).send(error.message);
		return;
	}
	try {
		for await (let uploadResult of uploadResults) {
			const { fileUrl, buffer, originalFilename, fileSize } = uploadResult;
			//insert document in mssql
			const insertDocumentResult = await insertDocument({
				documentName: originalFilename,
				documentUrl: fileUrl,
				documentSize: fileSize,
				convIntId: convIntId,
			});
			const documentId = insertDocumentResult.recordset[0].document_id;
			console.log('document id : ', documentId);
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
			console.log('upserted paragraphs to pinecon');
			await insertParagraphs_v2({ paragraphs, convIntId, documentId });
			console.log('inserted paragraphs');
		}
		await updateConvStatusModel({
			convIntId: convIntId,
			status: 'created',
			userId: userId,
		});

		console.log('updated conv status');
	} catch (error) {
		console.log('error 2 : ', error);
		if (convIntId) {
			await updateConvStatusModel({
				convIntId: convIntId,
				status: 'error',
				userId: userId,
			});
		}
		throw error;
	}
}
function generateConvId() {
	const currentTime = Date.now();
	const uniqueId = uuidv4();
	return `${uniqueId}-${currentTime}`;
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
module.exports = createConversationV9;
