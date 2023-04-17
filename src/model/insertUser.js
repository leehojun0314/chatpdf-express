const getSql = require('../database/connection');
function insertUser({ userName, userEmail, profileImg }) {
	return new Promise((resolve, reject) => {
		getSql().then((sqlPool) => {
			sqlPool
				.request()
				.input('user_name', userName)
				.input('user_email', userEmail)
				.input('profile_img', profileImg)
				.query(
					'INSERT INTO UserTable (user_name, user_email, profile_img) OUTPUT INSERTED.* VALUES (@user_name, @user_email, @profile_img)',
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
