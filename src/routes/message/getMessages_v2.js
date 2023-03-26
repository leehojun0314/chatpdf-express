const selectConversation_single = require('../../model/selectConversation_single');
const selectMessage = require('../../model/selectMessage');
const selectQuestion_all = require('../../model/selectQuestion_all');
async function getMessages_v2(req, res) {
	const conversationId = req.query.convId || '';
	console.log('conversation Id : ', conversationId);
	if (!conversationId) {
		res.status(404).send('please enter a valid conversation id');
		return;
	}

	try {
		//이전 메세지 로드
		const messagesResult = await selectMessage({ conversationId });
		const shiftedMessages = [...messagesResult.recordset];
		shiftedMessages.shift(); //처음 메세지는 곧 system 메세지 이므로 제외.

		//conversation 제목
		const conversation = await selectConversation_single({
			convId: conversationId,
		});
		console.log('conversation: ', conversation);

		//questions
		const questions = await selectQuestion_all({ convId: conversationId });
		console.log('questions: ', questions);
		res.status(200).json({
			messages: shiftedMessages,
			conversation: conversation,
			questions: questions,
		});
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
}

module.exports = getMessages_v2;
