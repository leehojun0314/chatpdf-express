const getSql = require('../database/connection');
function selectConvIntId({ convStringId }) {
	console.log('convStringId: ', convStringId);
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Conversation WHERE conversation_id = ${convStringId}`,
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
module.exports = selectConvIntId;
