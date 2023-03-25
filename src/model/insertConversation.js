const getSql = require('../database/connection');
function insertConversation(conversationName, userId, fileUrl) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('conversation_name', conversationName)
					.input('user_id', userId)
					.query(
						'INSERT INTO Conversation (conversation_name, user_id) OUTPUT INSERTED.conversation_id VALUES (@conversation_name, @user_id)',
					)
					.then((result) => {
						console.log('result: ', result);
						resolve(result);
					})
					.catch((err) => {
						console.log('insert conversation error : ', err);
						reject(err);
					});
			})
			.catch((err) => {
				reject(err);
			});
	});
}
module.exports = insertConversation;
