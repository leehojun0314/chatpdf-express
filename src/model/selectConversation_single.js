const getSql = require('../database/connection');
function selectConversation_single({ convId, userId }) {
	console.log('conv id : ', convId);
	console.log('user id : ', userId);
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Conversation WHERE conversation_id = ${convId} AND user_id = ${userId}`,
					)
					.then((result) => {
						resolve(result.recordset[0]);
					})
					.catch((err) => {
						reject(err);
					});
			})
			.catch((err) => {
				reject(err);
			});
	});
}
module.exports = selectConversation_single;
