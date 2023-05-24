const configs = require('../../../configs');
const insertQuestionV2 = require('../../model/insertQuestion_v2');
const selectConvIntId = require('../../model/selectConvIntId');
const selectDocument = require('../../model/selectDocument');
const selectParagraph_docu = require('../../model/selectParagraph_docu');
const createQuestion = require('../../utils/openai/createQuestion');

async function getQuestionsV2(req, res) {
	const convStringId = req.query.convStringId;
	const docuId = req.query.docuId;
	console.log('get question v2');
	console.log('docu id : ', docuId);
	const userId = req.user.user_id;
	try {
		const convIntId = await selectConvIntId({ convStringId: convStringId });
		console.log('conv int id : ', convIntId);
		const selectParagraphsResult = await selectParagraph_docu({
			convIntId,
			documentId: docuId,
		});
		console.log('select paragraph result: ', selectParagraphsResult);
		const paragraphs = selectParagraphsResult.recordset;
		const joinedParagraph = paragraphs
			.map((p) => p.paragraph_content)
			.join(' ')
			.slice(0, configs.createSalutationPLength);
		console.log('joined paragraph : ', joinedParagraph);
		const questions = await createQuestion(joinedParagraph);
		// const questionArr = questions.split('\n');
		//예상 질문 INSERT
		const docuResult = await selectDocument({
			convIntId,
			documentId: docuId,
		});
		console.log('docu result: ', docuResult);
		await insertQuestionV2({
			convIntId,
			questionsStr: questions,
			userId,
			documentName: docuResult.document_name,
			// questionArr: questionArr,
		});
		// const questionsResult = await selectQuestion_all({
		// 	convIntId: convIntId,
		// });
		// console.log('questions: ', questions);
		res.send({
			questions: questions,
			documentName: docuResult.document_name,
		});
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}
module.exports = getQuestionsV2;
