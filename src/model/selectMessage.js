const getSql = require('../database/connection');
function selectMessage({ convIntId, userId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Message WHERE conversation_id = '${convIntId}' AND user_id = ${userId} ORDER BY message_order ASC`,
					)
					.then((result) => {
						resolve(result);
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
module.exports = selectMessage;
