const getSql = require('../database/connection');
function selectDocuments({ convIntId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Document WHERE conversation_id = '${convIntId}'`,
					)
					.then((result) => {
						resolve(result.recordset);
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
module.exports = selectDocuments;
