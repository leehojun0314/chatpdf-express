const getSql = require('../database/connection');
function selectMessage_indi({ convId, userEmail }) {
	return new Promise((resolve, reject) => {
		getSql().then((sqlPool) => {
			sqlPool
				.request()
				.input('user_email', userEmail)
				.input('conversation_id', convId)
				.input('sender', 'system')
				.query(
					'SELECT m.* FROM Message m INNER JOIN UserTable u ON m.user_id = u.user_id WHERE (m.sender = @sender AND m.conversation_id = @conversation_id) OR (u.user_email = @user_email AND m.conversation_id = @conversation_id)',
				)
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					console.log('err: ', err);
					reject(err);
				});
		});
	});
}
module.exports = selectMessage_indi;
