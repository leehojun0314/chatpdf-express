const getSql = require('../database/connection');

function insertBatchParagraphs(batch, conversationId) {
	const values = batch
		.map((p) => `(${conversationId}, N'${p.content}', ${p.order_number})`)
		.join(', ');

	const query = `INSERT INTO Paragraph (conversation_id, paragraph_content, order_number) VALUES ${values}`;

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

async function insertParagraphs({ paragraphs, conversationId }) {
	const batchSize = 500;
	const batches = [];

	for (let i = 0; i < paragraphs.length; i += batchSize) {
		batches.push(paragraphs.slice(i, i + batchSize));
	}

	try {
		for (const batch of batches) {
			await insertBatchParagraphs(batch, conversationId);
		}
	} catch (error) {
		console.error('Error inserting paragraphs:', error);
	}
}

module.exports = insertParagraphs;
