const getSql = require('../database/connection');
function updateLastLogin({ userEmail, authType }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('user_email', userEmail)
					.input('auth_type', authType)
					.query(
						'UPDATE UserTable SET last_login = GETDATE() WHERE user_email = @user_email AND auth_type = @auth_type',
					)
					.then((result) => {
						console.log('update login result: ', result);
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
module.exports = updateLastLogin;
