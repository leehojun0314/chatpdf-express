const getSql = require('../database/connection');
function insertDebate({
	questionId,
	answerId,
	referContent,
	convIntId,
	userId,
}) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('question_id', questionId)
					.input('answer_id', answerId)
					.input('refer_content', referContent)
					.input('conversation_id', convIntId)
					.input('user_id', userId)
					.query(
						`INSERT INTO Debate (question_id, answer_id, refer_content, conversation_id, user_id) 
						VALUES (@question_id, @answer_id, @refer_content, @conversation_id, @user_id)`,
					)
					.then((result) => {
						console.log('insert debate result: ', result);
						resolve(result);
					})
					.catch((err) => {
						console.log('insert document error : ', err);
						reject(err);
					});
			})
			.catch((err) => {
				console.log('insert debate error');
				reject(err);
			});
	});
}
module.exports = insertDebate;
