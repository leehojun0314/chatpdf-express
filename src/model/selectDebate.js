const getSql = require('../database/connection');
function selectDebate({ answerId, userId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.input('answer_id', answerId)
					.input('user_id', userId)
					.query(
						`SELECT 
						    D.debate_id, 
						    D.question_id, 
						    D.answer_id, 
						    D.refer_content,
						    QM.message AS question_content,
						    AM.message AS answer_content
						FROM 
						    Debate D
						LEFT JOIN 
						    Message QM ON D.question_id = QM.message_id
						LEFT JOIN 
						    Message AM ON D.answer_id = AM.message_id
						WHERE 
						    D.answer_id = @answer_id AND D.user_id = @user_id;`,
					)
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						console.log('select debate error1 : ', err);
						reject(err);
					});
			})
			.catch((err) => {
				console.log('select debate error2', err);
				reject(err);
			});
	});
}
module.exports = selectDebate;
