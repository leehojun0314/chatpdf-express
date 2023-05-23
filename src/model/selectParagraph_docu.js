const getSql = require('../database/connection');
function selectParagraph_docu({ documentId, convIntId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Paragraph WHERE conversation_id = '${convIntId}' AND document_id = '${documentId}'`,
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
module.exports = selectParagraph_docu;
