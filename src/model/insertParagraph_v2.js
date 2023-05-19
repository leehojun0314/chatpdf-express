const getSql = require('../database/connection');

function insertBatchParagraphs(batch, documentId, convIntId) {
	const values = batch
		.map(
			(p) =>
				`(${documentId}, N'${p.content}', ${
					p.pageNumber || p.order_number
				}, ${convIntId})`,
		)
		.join(', ');

	const query = `INSERT INTO Paragraph (document_id, paragraph_content, order_number, conversation_id) VALUES ${values}`;

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

async function insertParagraphs_v2({ paragraphs, documentId, convIntId }) {
	const batchSize = 500;
	const batches = [];

	for (let i = 0; i < paragraphs.length; i += batchSize) {
		batches.push(paragraphs.slice(i, i + batchSize));
	}

	try {
		for (const batch of batches) {
			await insertBatchParagraphs(batch, documentId, convIntId);
		}
	} catch (error) {
		console.error('Error inserting paragraphs:', error);
	}
}

module.exports = insertParagraphs_v2;
