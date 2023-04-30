const getSql = require('../database/connection');
function updateSalutation({ convIntId, userId, salutation }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('convIntId', convIntId)
					.input('salutation', salutation)
					.input('user_id', userId)
					.query(
						'UPDATE Conversation SET salutation = @salutation WHERE id = @convIntId AND user_id = @user_id',
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
module.exports = updateSalutation;
