const getSql = require('../database/connection');
function insertDocument({
	documentName,
	documentUrl,
	convIntId,
	documentSize,
}) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('document_name', documentName)
					.input('document_url', documentUrl)
					.input('document_size', documentSize)
					.input('conversation_id', convIntId)
					.query(
						`INSERT INTO Document (document_name, document_url, document_size, conversation_id) 
						OUTPUT INSERTED.document_id VALUES (@document_name, @document_url, @document_size, @conversation_id)`,
					)
					.then((result) => {
						console.log('insert document result: ', result);
						resolve(result);
					})
					.catch((err) => {
						console.log('insert document error : ', err);
						reject(err);
					});
			})
			.catch((err) => {
				reject(err);
			});
	});
}
module.exports = insertDocument;
