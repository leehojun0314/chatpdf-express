const insertQuestion = require('../../model/insertQuestion');
const selectUser = require('../../model/selectUser');
const createQuestion = require('../../utils/openai/createQuestion');
const createSalutation = require('../../utils/openai/createSalutation');
const uploadBlob = require('../../utils/azureBlob/uploadBlob');
const PdfParse = require('pdf-parse');
const { extractKeyPhrase } = require('../../utils/azureLanguage/keyPhrase');
const insertParagraphs = require('../../model/insertParagraphs');
const updateSalutation = require('../../model/updateSalutation');
const insertConversation_v3 = require('../../model/insertConversation_v3');
const updateConvStatusModel = require('../../model/updateConvStatusModel');
const { v4: uuidv4 } = require('uuid');
const insertConv_v4 = require('../../model/insertConv_v4');
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

async function createConversationV7(req, res) {
	const user = req.user;
	console.log('user: ', user);
	let convIntId;
	let convStringId = generateConvId();
	console.log('conv string id : ', convStringId);
	let userId;
	try {
		//user id 가져오기 req.user에는 userid가 없음. 다른 db이기 떄문
		const selectUserResult = await selectUser({
			email: user.user_email,
			name: user.user_name,
		});
		userId = selectUserResult.recordset[0]?.user_id;
		if (!userId) {
			res.status(404).send('unknown user id');
			return;
		}
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
		await PdfParse(buffer, {
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
				order_number: i,
			});
		}
		await insertParagraphs({
			paragraphs,
			convIntId: convIntId,
		});
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

module.exports = createConversationV7;
