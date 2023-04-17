const getSql = require('../database/connection');
function insertDocument({ content, conversationId, summary, url }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('doc_content', content)
					.input('conversation_id', conversationId)
					.input('summary', summary)
					.input('url', url)
					.query(
						`INSERT INTO Document (doc_content, conversation_id, summary, url) OUTPUT INSERTED.doc_id
    VALUES (@doc_content, @conversation_id, @summary, @url)`,
					)
					.then((result) => {
						console.log('insert document result : ', result);
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
module.exports = insertDocument;
