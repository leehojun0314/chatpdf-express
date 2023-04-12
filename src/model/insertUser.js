const getSql = require('../database/connection');
function insertUser({ userName, userEmail }) {
	return new Promise((resolve, reject) => {
		getSql().then((sqlPool) => {
			sqlPool
				.request()
				.input('user_name', userName)
				.input('user_email', userEmail)
				.query(
					'INSERT INTO UserTable (user_name, user_email) OUTPUT INSERTED.* VALUES (@user_name, @user_email)',
				)
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					reject(err);
				});
		});
	});
}
module.exports = insertUser;
