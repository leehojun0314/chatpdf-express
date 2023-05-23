const getSql = require('../database/connection');

async function deleteConversationModel({ convIntId, userId }) {
	try {
		const sqlPool = await getSql();
		const transaction = sqlPool.transaction();
		await transaction.begin();

		// Get all Conversation IDs for the user, except for the one being deleted
		const conversationIds = await transaction
			.request()
			.input('user_id', userId)
			.input('conversation_id', convIntId).query(`SELECT conversation_id
					FROM Conversation
					WHERE user_id = @user_id AND conversation_id != @conversation_id`);

		console.log('conversation ids: ', conversationIds.recordset);
		// Get the latest Conversation ID

		let lastConv = null;

		// If there are other conversations, set last_conv to the latest one
		if (conversationIds.recordset.length > 0) {
			console.log('there are other conversation.');
			lastConv = conversationIds.recordset[0].conversation_id;
		}

		console.log('last conv: ', lastConv);
		// Update UserTable with new last_conv value
		await transaction
			.request()
			.input('user_id', userId)
			.input('last_conv', lastConv)
			.query(
				'UPDATE UserTable SET last_conv=@last_conv WHERE user_id=@user_id',
			);
		console.log('last_conv updated');
		// Delete Conversation
		await transaction.request().input('conversation_id', convIntId)
			.query(`DELETE FROM Message WHERE conversation_id=@conversation_id;
			DELETE FROM Question WHERE conversation_id=@conversation_id;
			DELETE FROM Document WHERE conversation_id=@conversation_id;
			DELETE FROM Conversation WHERE conversation_id=@conversation_id;
			`);

		await transaction.commit();
		console.log('Conversation deleted successfully');
		return true;
	} catch (error) {
		console.error('Error deleting conversation:', error);
		throw error;
	}
}

module.exports = deleteConversationModel;
