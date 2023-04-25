const getSql = require('../database/connection');
function insertParagraphs({ paragraphs, conversationId }) {
	const values = paragraphs
		.map(
			(p) =>
				`(${conversationId}, N'${p.content}', N'${p.keywords}', ${p.order_number})`,
		)
		.join(', ');
	// console.log('values: ', values);
	// 쿼리를 작성하고 실행
	const query = `INSERT INTO Paragraph (conversation_id, paragraph_content, keywords, order_number) VALUES ${values}`;
	// console.log('query : ', query);
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(query)
					.then((result) => {
						console.log('insert paragraph result : ', result);
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
module.exports = insertParagraphs;
