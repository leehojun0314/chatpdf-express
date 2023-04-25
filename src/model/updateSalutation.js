const getSql = require('../database/connection');
function updateSalutation({ convId, salutation }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('conversation_id', convId)
					.input('salutation', salutation)
					.query(
						'UPDATE Conversation SET salutation = @salutation WHERE conversation_id = @conversation_id',
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
