const uploadBlob = require('../../utils/azureBlob/uploadBlob');
const PdfParse = require('pdf-parse');
const insertParagraphs = require('../../model/insertParagraphs');
const updateConvStatusModel = require('../../model/updateConvStatusModel');
const { v4: uuidv4 } = require('uuid');
const insertConv_v4 = require('../../model/insertConv_v4');
const upsertParagraph_pinecone = require('../../utils/pinecone/upsertParagraph_pinecone');
const uploadBlob_v2 = require('../../utils/azureBlob/uploadBlob_v2');
const insertConv_v5 = require('../../model/insertConv_v5');
const insertDocument = require('../../model/insertDocument');
const upsertParagraph_v2 = require('../../utils/pinecone/upsertParagraph_v2');
const insertParagraphs_v2 = require('../../model/insertParagraph_v2');
const formidable = require('formidable');
function generateConvId() {
	const currentTime = Date.now();
	const uniqueId = uuidv4();
	return `${uniqueId}-${currentTime}`;
}
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
async function createConversationV9(req, res) {
	const user = req.user;
	console.log('user: ', user);
	let convIntId;
	let convStringId = generateConvId();
	console.log('conv string id : ', convStringId);
	let userId = user.user_id;
	try {
		const { fields, files } = await useFormidable(req);
		console.log('fields: ', fields);
		console.log('files: ', files);
		//upload blob
		const uploadResults = await uploadBlob_v2(files);
		console.log('upload complete');
		console.log('upload results: ', uploadResults);

		//conversation 생성
		const conversationResult = await insertConv_v5({
			conversationName: fields.conversationName,
			userId,
			convStringId,
		});

		convIntId = conversationResult.recordset[0].id;

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

			const replacedTexts = pages.join('').replaceAll(' ', '');
			if (!(replacedTexts.length > 0)) {
				console.log("couldn't extract text from the file");
				// await updateConvStatusModel({
				// 	convIntId: convIntId,
				// 	status: 'error',
				// 	userId: userId,
				// });
				// res.status(500).send("Couldn't extract text from the file");
				throw new Error("Couldn't extract text from the file");
			}

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
			console.log(
				'paragraphs: ',
				paragraphs.map((p) => {
					return {
						pageNumber: p.pageNumber,
						convIntId: p.convIntId,
						docuId: p.docuId,
						docuInfo: p.docuInfo,
						docuName: p.docuName,
					};
				}),
			);
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
		res.status(201).send({
			message: 'conversation created',
			createdId: convIntId,
		});
		console.log('updated conv status');
	} catch (error) {
		console.log('catch error: ', error);
		await updateConvStatusModel({
			convIntId: convIntId,
			status: 'error',
			userId: userId,
		});
		res.status(500).send(error);
	}
}

module.exports = createConversationV9;
