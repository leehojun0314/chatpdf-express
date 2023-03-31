const getSql = require('../database/connection');
const insertUser = require('./insertUser');
function selectUser({ email, name }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(`SELECT * FROM UserTable WHERE user_email = '${email}'`)
					.then((result) => {
						if (!result.recordset.length) {
							insertUser({ userName: name, userEmail: email })
								.then((insertResult) => {
									resolve(insertResult);
								})
								.catch((error) => {
									reject(error);
								});
						} else {
							resolve(result);
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
