const getSql = require('../database/connection');
function updateLastConv({ userId, convId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('user_id', userId)
					.input('conversation_id', convId)
					.query(
						'UPDATE UserTable SET last_conv = @conversation_id WHERE user_id = @user_id',
					)
					.then((result) => {
						console.log('update result: ', result);
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
module.exports = updateLastConv;
