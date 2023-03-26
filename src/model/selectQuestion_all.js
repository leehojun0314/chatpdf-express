const getSql = require('../database/connection');
function selectQuestion_all({ convId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Question WHERE conversation_id = '${convId}'`,
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
module.exports = selectQuestion_all;
