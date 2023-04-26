const getSql = require('../database/connection');
function updateSalutation({ convId, userId, salutation }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('conversation_id', convId)
					.input('salutation', salutation)
					.input('user_id', userId)
					.query(
						'UPDATE Conversation SET salutation = @salutation WHERE conversation_id = @conversation_id AND user_id = @user_id',
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
