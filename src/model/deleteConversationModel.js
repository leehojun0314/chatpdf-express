const getSql = require('../database/connection');

async function deleteConversationModel({ convIntId, userId }) {
	try {
		const sqlPool = await getSql();
		const transaction = sqlPool.transaction();
		await transaction.begin();

		// Get user_id of the conversation
		const { recordset } = await transaction
			.request()
			.input('conversation_id', convIntId)
			.query(`SELECT user_id FROM Conversation WHERE id=@conversation_id;`);

		// If the conversation doesn't exist or the user_id doesn't match, throw an error
		if (recordset.length === 0 || recordset[0].user_id !== userId) {
			throw new Error(
				'User does not have permission to delete this conversation',
			);
		}

		// Delete Conversation
		const queryResponse = await transaction
			.request()
			.input('conversation_id', convIntId)
			.query(`DELETE FROM Message WHERE conversation_id=@conversation_id;
			DELETE FROM Paragraph WHERE conversation_id=@conversation_id;
			DELETE FROM Document WHERE conversation_id=@conversation_id;
			DELETE FROM Conversation WHERE id=@conversation_id;
			`);
		console.log('query response: ', queryResponse);
		await transaction.commit();
		console.log('Conversation deleted successfully');
		return true;
	} catch (error) {
		console.error('Error deleting conversation:', error);
		throw error;
	}
}

module.exports = deleteConversationModel;
