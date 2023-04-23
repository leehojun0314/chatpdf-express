const getSql = require('../database/connection');
function insertConversation({ conversationName, userId, fileUrl, salutation }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('conversation_name', conversationName)
					.input('user_id', userId)
					.input('fileUrl', fileUrl)
					.input('salutation', salutation)
					.query(
						`INSERT INTO Conversation (conversation_name, user_id, fileUrl, salutation, created_at) 
						OUTPUT INSERTED.conversation_id VALUES (@conversation_name, @user_id, @fileUrl, @salutation, GETDATE())`,
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
