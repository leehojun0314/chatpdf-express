const getSql = require('../database/connection');
function insertMessage({ message, conversationId, sender, messageOrder }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('message', message)
					.input('conversation_id', conversationId)
					.input('sender', sender)
					.input('message_order', messageOrder)
					.query(
						`INSERT INTO Message (message, conversation_id, sender, message_order)
    VALUES (@message, @conversation_id, @sender, @message_order)`,
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
