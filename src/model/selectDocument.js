const getSql = require('../database/connection');
function selectDocument({ convIntId, documentId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Document WHERE conversation_id = '${convIntId}' AND document_id = '${documentId}'`,
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
module.exports = selectDocument;
