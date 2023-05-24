const selectConvIntId = require('../../model/selectConvIntId');
const selectConversation_single = require('../../model/selectConversation_single');
const selectMessage_indi = require('../../model/selectMessage_indi');
const selectQuestion_all = require('../../model/selectQuestion_all');

async function getMessages_v4(req, res) {
	const convStringId = req.query.convId || '';
	const userEmail = req.user.user_email;
	if (!convStringId) {
		res.status(400).send('please enter a valid conversation id');
		return;
	}
	try {
		//user email과 convid로 메세지 로드
		let convIntId = await selectConvIntId({ convStringId: convStringId });
		const messagesResult = await selectMessage_indi({
			convIntId: convIntId,
			userEmail: userEmail,
		});
		//메세지를 ai에게 보낼때 해당 convid의 0번째 메세지를 항상 조회를 하고 보냄.
		//따라서 user_id가 없는 0번째 메세지를 거를 필요가 없다.
		// const shiftedMessages = [...messagesResult.recordset];
		// shiftedMessages.shift();
		//conversation 제목
		const conversation = await selectConversation_single({
			convIntId: convIntId,
			userId: req.user.user_id,
		});
		//questions
		// const questions = await selectQuestion_all({ convIntId: convIntId });
		res.status(200).json({
			messages: messagesResult.recordset,
			conversation: conversation,
			// questions: questions,
		});
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}

module.exports = getMessages_v4;
