const configs = require('../../configs');
const getSql = require('../database/connection');
function insertConv_v5({ conversationName, userId, convStringId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('conversation_name', conversationName)
					.input('user_id', userId)
					.input('conversation_id', convStringId)
					.input('salutation', configs.salutationPrefixMessage)
					.query(
						`INSERT INTO Conversation (conversation_name, user_id, created_at, status, conversation_id, salutation, visibility) 
						OUTPUT INSERTED.id VALUES (@conversation_name, @user_id, GETDATE(), 'analyzing', @conversation_id, @salutation, 0)`,
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
module.exports = insertConv_v5;
