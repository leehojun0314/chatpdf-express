const selectConvIntId = require('../../model/selectConvIntId');
const selectConversation_single = require('../../model/selectConversation_single');

async function checkConversation(req, res) {
	try {
		console.log('req : ', req.user);
		const user = req.user;
		const userId = user.user_id;
		const convStringId = req.query.convId;
		const convIntId = await selectConvIntId({ convStringId });
		console.log('conv int id : ', convIntId);
		const selectedConv = await selectConversation_single({
			convIntId,
			userId,
		});
		console.log('selectedConv : ', selectedConv);
		res.send(selectedConv);
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}
module.exports = checkConversation;
