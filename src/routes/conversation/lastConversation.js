const selectConvIntId = require('../../model/selectConvIntId');
const updateLastConv = require('../../model/updateLastConv');

async function lastConversation(req, res) {
	const convStringId = req.body.convId || '';
	const userId = req.user.user_id;
	if (!convStringId) {
		res.status(500).send('invalid conversation id');
	}
	try {
		const convIntId = await selectConvIntId({ convStringId });
		await updateLastConv({ userId: userId, convIntId });
		res.send('updated');
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}
module.exports = lastConversation;
