const getSql = require('../database/connection');

function selectConversation_single({ convIntId, userId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Conversation WHERE [id] = ${convIntId} AND (visibility = 1 OR (visibility = 0 AND user_id = ${userId}))`,
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
