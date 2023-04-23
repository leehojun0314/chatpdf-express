const getSql = require('../database/connection');

async function updateConversationNameModel({ convId, userId, newName }) {
	try {
		const sqlPool = await getSql();
		const transaction = sqlPool.transaction();
		await transaction.begin();

		// Check if Conversation exists and user_id matches
		const conversation = await transaction
			.request()
			.input('conversation_id', convId)
			.input('user_id', userId).query(`SELECT *
					FROM Conversation
					WHERE conversation_id = @conversation_id AND user_id = @user_id`);

		if (conversation.recordset.length === 0) {
			throw new Error('Conversation not found for the given user');
		}

		// Update Conversation name
		await transaction
			.request()
			.input('conversation_id', convId)
			.input('conversation_name', newName)
			.query(
				'UPDATE Conversation SET conversation_name=@conversation_name WHERE conversation_id=@conversation_id',
			);

		await transaction.commit();
		console.log('Conversation name updated successfully');
		return true;
	} catch (error) {
		console.error('Error updating conversation name:', error);
		throw error;
	}
}
module.exports = updateConversationNameModel;
