const configs = require('../../../configs');
const insertQuestion = require('../../model/insertQuestion');
const selectConvIntId = require('../../model/selectConvIntId');
const selectParagraph_all = require('../../model/selectParagraph_all');
const selectQuestion_all = require('../../model/selectQuestion_all');
const createQuestion = require('../../utils/openai/createQuestion');

async function getQuestions(req, res) {
	const convStringId = req.query.convStringId;
	try {
		const convIntId = await selectConvIntId({ convStringId: convStringId });
		const selectParagraphsResult = await selectParagraph_all({
			convIntId,
		});
		const paragraphs = selectParagraphsResult.recordset;
		const joinedParagraph = paragraphs
			.map((p) => p.paragraph_content)
			.join(' ')
			.slice(0, configs.createSalutationPLength);
		console.log('joined paragraph : ', joinedParagraph);
		const questions = await createQuestion(joinedParagraph);
		const questionArr = questions.split('\n');
		//예상 질문 INSERT
		await insertQuestion({
			convIntId: convIntId,
			questionArr: questionArr,
		});
		const questionsResult = await selectQuestion_all({
			convIntId: convIntId,
		});
		console.log('questions: ', questions);
		res.send({ questions: questionsResult });
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}
module.exports = getQuestions;
