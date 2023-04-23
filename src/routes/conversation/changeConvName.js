const updateConversationNameModel = require('../../model/changeConvNameModel');

function changeConvName(req, res) {
	const convId = req.body.convId;
	const newName = req.body.newName;
	const userId = req.user.user_id;
	console.log('conv id :', convId);
	console.log('new name: ', newName);
	updateConversationNameModel({
		convId,
		userId,
		newName,
	})
		.then((updateRes) => {
			console.log('update res: ', updateRes);
			res.send('updated successfully');
		})
		.catch((err) => {
			console.log('update err: ', err);
			res.status(500).send(err);
		});
}
module.exports = changeConvName;
