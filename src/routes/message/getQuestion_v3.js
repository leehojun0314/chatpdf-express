const configs = require('../../../configs');
const insertQuestionV2 = require('../../model/insertQuestion_v2');
const selectConvIntId = require('../../model/selectConvIntId');
const selectDocument = require('../../model/selectDocument');
const selectParagraph_docu = require('../../model/selectParagraph_docu');
const createQuestion = require('../../utils/openai/createQuestion');
const createQuestionStream = require('../../utils/openai/createQuestion_stream');

async function getQuestionsV3(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
	const convStringId = req.query.convStringId;
	const docuId = req.query.docuId;
	console.log('get question v2');
	console.log('docu id : ', docuId);
	const userId = req.user.user_id;
	try {
		const convIntId = await selectConvIntId({ convStringId: convStringId });
		const selectParagraphsResult = await selectParagraph_docu({
			convIntId,
			documentId: docuId,
		});
		const paragraphs = selectParagraphsResult.recordset;
		//지문의 앞부분 추출
		const joinedParagraph = paragraphs
			.map((p) => p.paragraph_content)
			.join(' ')
			.slice(0, configs.createSalutationPLength);
		//stream callback 선언
		const docuResult = await selectDocument({
			convIntId,
			documentId: docuId,
		});
		async function questionStreamCallback({ text, isEnd, error }) {
			if (error) {
				console.log('question stream callback error: ', error);
				res.status(500).send(error.message);
				throw new Error(error.message);
			}
			if (isEnd) {
				await insertQuestionV2({
					convIntId,
					questionsStr: text,
					userId,
					documentName: docuResult.document_name,
				});
				res.end('');
			} else {
				console.log('text: ', text);
				res.write(
					JSON.stringify({
						text,
						documentName: docuResult.document_name,
					}) + '#',
				);
			}
		}
		//예상 질문 생성
		// const questions = await createQuestion(joinedParagraph);
		await createQuestionStream(joinedParagraph, questionStreamCallback);
		//예상 질문 INSERT
		// const docuResult = await selectDocument({
		// 	convIntId,
		// 	documentId: docuId,
		// });
		// await insertQuestionV2({
		// 	convIntId,
		// 	questionsStr: questions,
		// 	userId,
		// 	documentName: docuResult.document_name,
		// });
		// res.send({
		// 	questions: questions,
		// 	documentName: docuResult.document_name,
		// });
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error.message);
	}
}
module.exports = getQuestionsV3;
