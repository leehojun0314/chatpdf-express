const getSql = require('../database/connection');
async function insertQuestion({ conversationId, questionArr }) {
	try {
		const sqlPool = await getSql();
		for (let i = 0; i < questionArr.length; i++) {
			await sqlPool
				.request()
				.input('question_content', questionArr[i])
				.input('question_order', i)
				.input('conversation_id', conversationId)
				.query(`INSERT INTO Question (question_content, question_order, conversation_id) 
                    VALUES (@question_content, @question_order, @conversation_id)
                    `);
			console.log('inserted question : ', questionArr);
		}
		return { status: true };
	} catch (err) {
		console.log('err: ', err);
		return { status: false, error: err };
	}
}
module.exports = insertQuestion;
