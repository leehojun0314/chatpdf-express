const getSql = require('../database/connection');
/**
 *
 * @param {{convIntId : int, userId : int,status : 'created' | 'deleted' | 'analyzing' | 'error'}} param0
 * @returns
 */
async function updateConvStatusModel({ convIntId, userId, status }) {
	try {
		const sqlPool = await getSql();
		await sqlPool
			.request()
			.input('convIntId', convIntId)
			.input('status', status)
			.input('user_id', userId).query(`
        UPDATE Conversation SET status = @status WHERE id = @convIntId AND user_id = @user_id`);
		return true;
	} catch (error) {
		console.error('Error changing conversation status:', error);
		return false;
	}
}

module.exports = updateConvStatusModel;
