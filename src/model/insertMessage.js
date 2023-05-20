const getSql = require('../database/connection');
function insertMessage({ message, convIntId, sender, messageOrder, userId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('message', message)
					.input('convIntId', convIntId)
					.input('sender', sender)
					// .input('message_order', messageOrder)
					.input('user_id', userId)
					// 				.query(
					// 					`INSERT INTO Message (message, conversation_id, sender, message_order, user_id, created_time)
					// VALUES (@message, @convIntId, @sender, @message_order, @user_id, GETDATE())`,
					// 				)
					.query(
						`INSERT INTO Message (message, conversation_id, sender, user_id, created_time)
VALUES (@message, @convIntId, @sender, @user_id, GETDATE())`,
					)
					.then((result) => {
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
module.exports = insertMessage;
