const selectConversation = require('../../model/selectConversation_all');
async function getConversations(req, res) {
	const userData = req.user;
	try {
		console.log('user id : ', userData.user_id);
		const selectConverData = await selectConversation({
			userId: userData.user_id,
		});
		res.status(200).json(selectConverData.recordset);
	} catch (error) {
		console.log('error : ', error);
		res.status(400).send(error);
	}
}

module.exports = getConversations;
