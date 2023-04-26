const selectConversation_single = require('../../model/selectConversation_single');

async function checkConversation(req, res) {
	try {
		console.log('req : ', req.user);
		const user = req.user;
		const userId = user.user_id;
		const convId = req.query.convId;
		const selectedConv = await selectConversation_single({ convId, userId });
		console.log('selectedConv : ', selectedConv);
		res.send(selectedConv);
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}
module.exports = checkConversation;
