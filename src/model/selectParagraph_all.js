const getSql = require('../database/connection');
function selectParagraph_all({ convIntId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Paragraph WHERE conversation_id = '${convIntId}'`,
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
module.exports = selectParagraph_all;
