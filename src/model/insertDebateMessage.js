const getSql = require('../database/connection');
function insertDebateMessage({ content, sender, debateId, convIntId, userId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('content', content)
					.input('sender', sender)
					.input('debate_id', debateId)
					.input('conversation_id', convIntId)
					.input('user_id', userId)
					.query(
						`INSERT INTO Debate_Message (content, sender, debate_id, conversation_id, user_id, time) 
						VALUES (@content, @sender, @debate_id, @conversation_id, @user_id, GETDATE())`,
					)
					.then((result) => {
						console.log('insert debate message result: ', result);
						resolve(result);
					})
					.catch((err) => {
						console.log('insert debate message error : ', err);
						reject(err);
					});
			})
			.catch((err) => {
				console.log('insert debate error');
				reject(err);
			});
	});
}
module.exports = insertDebateMessage;
