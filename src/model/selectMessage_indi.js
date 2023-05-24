const getSql = require('../database/connection');
function selectMessage_indi({ convIntId, userEmail }) {
	return new Promise((resolve, reject) => {
		getSql().then((sqlPool) => {
			sqlPool
				.request()
				.input('user_email', userEmail)
				.input('convIntId', convIntId)
				.input('sender', 'system')
				.query(
					'SELECT m.* FROM Message m INNER JOIN UserTable u ON m.user_id = u.user_id WHERE (m.sender = @sender AND m.conversation_id = @convIntId) OR (u.user_email = @user_email AND m.conversation_id = @convIntId) ORDER BY message_id ASC',
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
