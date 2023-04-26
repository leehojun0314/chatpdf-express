const insertQuestion = require('../../model/insertQuestion');
const selectUser = require('../../model/selectUser');
const createQuestion = require('../../utils/openai/createQuestion');
const createSalutation = require('../../utils/openai/createSalutation');
const uploadBlob = require('../../utils/azureBlob/uploadBlob');
const insertConversation_v2 = require('../../model/insertConversation_v2');
const PdfParse = require('pdf-parse');
const { extractKeyPhrase } = require('../../utils/azureLanguage/keyPhrase');
const insertParagraphs = require('../../model/insertParagraphs');
const { summarization } = require('../../utils/azureLanguage/summarization');
const updateSalutation = require('../../model/updateSalutation');
const insertConversation_v3 = require('../../model/insertConversation_v3');
const updateConvStatusModel = require('../../model/updateConvStatusModel');
const updateLastConv = require('../../model/updateLastConv');
function pageRender(pageData) {
	// 텍스트 레이어를 추출합니다.
	return pageData.getTextContent().then((textContent) => {
		const mappedText = textContent.items.map((item) => item.str).join(' ');
		console.log('mapped text: ', mappedText);
		// return {
		// 	pageNumber: pageData.pageNumber,
		// 	text: textContent.items.map((item) => item.str).join(' '),
		// };
		return mappedText;
	});
}
function escapeQuotation(str) {
	return str.replace(/'/g, "''");
}
async function processArrayInBatches(arr, batchSize) {
	const result = [];

	for (let i = 0; i < arr.length; i += batchSize) {
		const batch = arr.slice(i, i + batchSize);
		const batchResult = await extractKeyPhrase(batch);
		result.push(...batchResult);
	}

	return result;
}

async function createConversationV5(req, res) {
	const user = req.user;
	console.log('user: ', user);
	let conversationId;
	try {
		//user id 가져오기 req.user에는 userid가 없음. 다른 db이기 떄문
		const selectUserResult = await selectUser({
			email: user.user_email,
			name: user.user_name,
		});
		const userId = selectUserResult.recordset[0]?.user_id;
		if (!userId) {
			res.status(404).send('unknown user id');
			return;
		}
		//upload blob
		const { fileUrl, fields, extension, buffer } = await uploadBlob(req);

		//conversation 생성
		const conversationResult = await insertConversation_v3({
			conversationName: fields.conversationName,
			userId,
			fileUrl,
		});

		conversationId = conversationResult.recordset[0].conversation_id;
		res.status(201).send({
			message: 'conversation created',
			createdId: conversationId,
		});

		//get pdf text && keyphrase of paragraphs
		const document = await PdfParse(buffer, { pagerender: pageRender });
		const textArr = document.text.split('\n');
		const filteredArr = textArr.filter((el) => (el ? true : false));

		const extracted = await processArrayInBatches(filteredArr, 25);
		console.log('extracted: ', extracted);
		console.log('filteredArr: ', filteredArr);
		const paragraphs = [];
		for (let i = 0; i < filteredArr.length; i++) {
			paragraphs.push({
				content: escapeQuotation(filteredArr[i]),
				keywords: escapeQuotation(extracted[i].join(', ')),
				order_number: i,
			});
		}
		await insertParagraphs({
			paragraphs,
			conversationId: conversationId,
		});
		//summarize
		// const optimizedText = document.text.replace(/\n/g, '');
		// const summarizedText = await summarization(optimizedText);
		const joinedText = document.text.slice(0, 2500); //앞에 2500자 까지만 제공
		//salutation 생성
		const salutation = await createSalutation(joinedText);
		console.log('salutation: ', salutation);
		await updateSalutation({
			convId: conversationId,
			salutation,
			userId: userId,
		});
		// //초기 메세지 생성
		// const messageDB = generator.systemMessageDB(conversationId, summarizedText);

		//생성된 초기 메세지 삽입
		// await insertMessage(messageDB);
		// const conversationsResult = await selectConversation_all({ userId });
		// const conversations = conversationsResult.recordset;
		//예상 질문 생성 //todo
		const questions = await createQuestion(joinedText);
		const questionArr = questions.split('\n');
		//예상 질문 INSERT
		await insertQuestion({
			conversationId: conversationId,
			questionArr: questionArr,
		});
		console.log('questions: ', questions);
		// res.status(201).send({
		// 	message: 'conversation created',
		// 	createdId: conversationId,
		// });
		await updateConvStatusModel({
			convId: conversationId,
			status: 'created',
			userId: userId,
		});
		console.log('updated conv status');
	} catch (error) {
		console.log('error: ', error);
		await updateConvStatusModel({
			convId: conversationId,
			status: 'error',
		});
	}
}

module.exports = createConversationV5;
