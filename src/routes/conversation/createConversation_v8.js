const uploadBlob = require('../../utils/azureBlob/uploadBlob');
const PdfParse = require('pdf-parse');
const insertParagraphs = require('../../model/insertParagraphs');
const updateConvStatusModel = require('../../model/updateConvStatusModel');
const { v4: uuidv4 } = require('uuid');
const insertConv_v4 = require('../../model/insertConv_v4');
const upsertParagraph_pinecone = require('../../utils/pinecone/upsertParagraph_pinecone');
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

async function createConversationV8(req, res) {
	const user = req.user;
	console.log('user: ', user);
	let convIntId;
	let convStringId = generateConvId();
	console.log('conv string id : ', convStringId);
	let userId = user.user_id;
	try {
		//upload blob
		const { fileUrl, fields, buffer } = await uploadBlob(req);

		//conversation 생성
		const conversationResult = await insertConv_v4({
			conversationName: fields.conversationName,
			userId,
			fileUrl,
			convStringId: convStringId,
		});

		convIntId = conversationResult.recordset[0].id;

		//get pdf text
		const pages = [];
		const document = await PdfParse(buffer, {
			pagerender: pageRender(pages),
		});
		//check validated text

		const replacedTexts = pages.join('').replaceAll(' ', '');
		if (!(replacedTexts.length > 0)) {
			console.log("couldn't extract text from the file");
			await updateConvStatusModel({
				convIntId: convIntId,
				status: 'error',
				userId: userId,
			});
			res.status(500).send("Couldn't extract text from the file");
			return;
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
			});
		}
		console.log('paragraphs: ', paragraphs);
		const upsertResult = await upsertParagraph_pinecone(
			paragraphs,
			convIntId,
		);
		await insertParagraphs({
			paragraphs,
			convIntId: convIntId,
		});
		console.log('upsert result: ', upsertResult);
		await updateConvStatusModel({
			convIntId: convIntId,
			status: 'created',
			userId: userId,
		});
		res.status(201).send({
			message: 'conversation created',
			createdId: convIntId,
		});
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

module.exports = createConversationV8;
