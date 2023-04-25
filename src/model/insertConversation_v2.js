const getSql = require('../database/connection');
function insertConversation_v2({ conversationName, userId, fileUrl }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('conversation_name', conversationName)
					.input('user_id', userId)
					.input('fileUrl', fileUrl)
					.query(
						`INSERT INTO Conversation (conversation_name, user_id, created_at, fileUrl) 
						OUTPUT INSERTED.conversation_id VALUES (@conversation_name, @user_id, GETDATE(), @fileUrl)`,
					)
					.then((result) => {
						console.log('insert conversation result: ', result);
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
module.exports = insertConversation_v2;
