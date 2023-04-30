const getSql = require('../database/connection');
function updateLastConv({ userId, convIntId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('user_id', userId)
					.input('convIntId', convIntId)
					.query(
						'UPDATE UserTable SET last_conv = @convIntId WHERE user_id = @user_id',
					)
					.then((result) => {
						console.log('update result: ', result);
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
module.exports = updateLastConv;
