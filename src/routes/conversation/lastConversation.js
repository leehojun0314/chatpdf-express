const updateLastConv = require('../../model/updateLastConv');

async function lastConversation(req, res) {
	const convId = req.body.convId;
	const userId = req.user.user_id;
	try {
		await updateLastConv({ userId: userId, convId: convId });
		res.send('updated');
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}
module.exports = lastConversation;
