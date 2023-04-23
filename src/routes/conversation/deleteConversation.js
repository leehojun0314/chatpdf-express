const deleteConversationModel = require('../../model/deleteConversationModel');

async function deleteConversation(req, res) {
	const convId = req.query.convId;
	const userId = req.user.user_id;

	console.log('delete conv id : ', convId);
	if (!convId) {
		res.status(404).send('conversation id is not given');
		return;
	}
	try {
		await deleteConversationModel({ convId, userId });
		res.status(200).send('conversation deleted');
	} catch (error) {
		console.log('delete error : ', error);
		res.status(500).send(error);
	}
}
module.exports = deleteConversation;
