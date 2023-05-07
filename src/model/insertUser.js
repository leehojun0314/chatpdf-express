const getSql = require('../database/connection');
function insertUser({ userName, userEmail, profileImg, authId, authType }) {
	return new Promise((resolve, reject) => {
		getSql().then((sqlPool) => {
			sqlPool
				.request()
				.input('user_name', userName)
				.input('user_email', userEmail)
				.input('profile_img', profileImg)
				.input('authType', authType)
				.input('authId', authId ? authId : '')
				.query(
					'INSERT INTO UserTable (user_name, user_email, profile_img, auth_id, auth_type) OUTPUT INSERTED.* VALUES (@user_name, @user_email, @profile_img, @authId, @authType)',
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
