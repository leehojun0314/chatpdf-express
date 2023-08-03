const getSql = require('../database/connection');

async function deleteDocument({ docuId, convIntId }) {
	try {
		const sqlPool = await getSql();
		const transaction = sqlPool.transaction();
		await transaction.begin();

		await transaction
			.request()
			.input('convIntId', convIntId)
			.input('docuId', docuId).query(`
		DELETE FROM Paragraph WHERE document_id=@docuId AND conversation_id=@convIntId;
		DELETE FROM Document WHERE document_id=@docuId AND conversation_id=@convIntId;
		`);

		await transaction.commit();
		console.log('document deleted successfully');
		return true;
	} catch (error) {
		console.log('delete document error: ', error);
		throw error;
	}
}
module.exports = deleteDocument;
