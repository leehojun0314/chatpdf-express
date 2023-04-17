const express = require('express');
const router = express.Router();
const insertConversation = require('../../model/insertConversation');
const insertMessage = require('../../model/insertMessage');
const insertQuestion = require('../../model/insertQuestion');
const selectUser = require('../../model/selectUser');
const createQuestion = require('../../utils/openai/createQuestion');
const generator = require('../../utils/generator');
const getPDFText = require('../../utils/getPdfText');
const uploadS3 = require('../../utils/uploadS3');
const createSalutation = require('../../utils/openai/createSalutation');

async function createConversationV2(req, res) {
	const user = req.user;
	console.log('user: ', user);
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
		//파일 크기 체크 //todo

		//upload s3
		const { fileUrl, fields } = await uploadS3(req);
		//formidalble을 사용하기때문에 body의 내용이 fields로 반환됨
		const conversationName = fields.conversationName;

		//text변환
		const allTexts = await getPDFText(fileUrl);

		//salutation 생성
		const salutation = await createSalutation(allTexts);
		console.log('salutation: ', salutation);

		//conversation 생성
		const insertedConversationData = await insertConversation({
			conversationName,
			userId,
			fileUrl,
			salutation,
		});
		const conversationId =
			insertedConversationData.recordset[0].conversation_id;

		//초기 메세지 생성
		const messageDB = generator.systemMessageDB(conversationId, allTexts);

		//생성된 초기 메세지 삽입
		await insertMessage(messageDB);
		const conversations = insertedConversationData.recordset;

		//예상 질문 생성 //todo
		const questions = await createQuestion(allTexts);
		const questionArr = questions.split('\n');
		//예상 질문 INSERT
		await insertQuestion({
			conversationId: conversationId,
			questionArr: questionArr,
		});

		res.status(201).send({
			message: 'conversation created',
			conversations,
		});
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}

module.exports = createConversationV2;
