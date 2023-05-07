const getSql = require('../database/connection');
const insertUser = require('./insertUser');
const updateLastLogin = require('./updateLastLogin');
function updateAuthInfo(sqlPool, email, authId, authType) {
	return sqlPool
		.request()
		.query(
			`UPDATE UserTable SET auth_id = '${authId}', auth_type = '${authType}' WHERE user_email = '${email}'`,
		);
}
function selectUser({ email, name, profileImg, authId, authType }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM UserTable WHERE user_email = '${email}' AND auth_type = '${authType}'`,
					)
					.then((result) => {
						console.log('select user result: ', result);
						if (!result.recordset.length) {
							insertUser({
								userName: name,
								userEmail: email,
								profileImg,
								authId,
								authType,
							})
								.then((insertResult) => {
									resolve(insertResult);
									updateLastLogin({
										userEmail: email,
										authType: authType,
									});
								})
								.catch((error) => {
									reject(error);
								});
						} else {
							const userData = result.recordset[0];

							if (!userData.authId || !userData.authType) {
								updateAuthInfo(sqlPool, email, authId, authType)
									.then((updateResult) => {
										console.log('update result: ', updateResult);
										// Update the userData object with the new authId and authType
										userData.authId = authId;
										userData.authType = authType;
										resolve({ recordset: [userData] });
										updateLastLogin({
											userEmail: email,
											authType: authType,
										});
									})
									.catch((error) => {
										reject(error);
									});
							} else {
								resolve(result);
								updateLastLogin({
									userEmail: email,
									authType: authType,
								});
							}
						}
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
module.exports = selectUser;
