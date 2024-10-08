const insertConversation = require('../../model/insertConversation');
const insertMessage = require('../../model/insertMessage');
const generator = require('../../utils/generator');
const getPDFText = require('../../utils/getPdfText');
const uploadS3 = require('../../utils/uploadS3');

async function createConversation(req, res) {
	const user = req.user;
	console.log('user: ', user);
	try {
		const userId = user.user_id;

		//upload s3
		const { fileUrl, fields } = await uploadS3(req);
		//formidalble을 사용하기때문에 body의 내용이 fields로 반환됨
		const conversationName = fields.conversationName;

		//text변환
		const allTexts = await getPDFText(fileUrl);

		//conversation 생성
		const insertedConversationData = await insertConversation(
			conversationName,
			userId,
			fileUrl,
		);

		//초기 메세지 생성
		const message = generator.systemMessageDB(
			insertedConversationData.recordset[0].conversation_id,
			allTexts,
		);

		//생성된 초기 메세지 삽입
		const messageResult = await insertMessage(message);
		const conversations = insertedConversationData.recordset;
		res.status(201).send({
			message: 'conversation created',
			conversations,
		});
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}

module.exports = createConversation;
