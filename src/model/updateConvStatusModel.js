const getSql = require('../database/connection');
/**
 *
 * @param {{convId : int, userId : int,status : 'created' | 'deleted' | 'analyzing' | 'error'}} param0
 * @returns
 */
async function updateConvStatusModel({ convId, userId, status }) {
	try {
		const sqlPool = await getSql();
		const result = await sqlPool
			.request()
			.input('conversation_id', convId)
			.input('status', status)
			.input('user_id', userId).query(`
        UPDATE Conversation SET status = @status WHERE conversation_id = @conversation_id AND user_id = @user_id`);
		console.log(`conversation status update result : `);
		console.log(result);
		console.log(convId);
		console.log(userId);
		console.log(status);
		return true;
	} catch (error) {
		console.error('Error changing conversation status:', error);
		return false;
	}
}

module.exports = updateConvStatusModel;
