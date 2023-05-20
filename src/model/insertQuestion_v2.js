const getSql = require('../database/connection');
async function insertQuestionV2({
	convIntId,
	questionsStr,
	userId,
	documentName,
}) {
	try {
		const sqlPool = await getSql();
		await sqlPool
			.request()
			.input('message', questionsStr)
			.input('conversation_id', convIntId)
			.input('user_id', userId)
			.input('document_name', documentName)
			.query(`INSERT INTO Message (message, conversation_id, user_id, is_question, sender, created_time, question_doc_name) 
                    VALUES (@message, @conversation_id, @user_id, 1, 'assistant', GETDATE(), @document_name)
                    `);
		return { status: true };
	} catch (err) {
		console.log('err: ', err);
		return { status: false, error: err };
	}
}
module.exports = insertQuestionV2;
