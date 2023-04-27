const insertQuestion = require('../../model/insertQuestion');
const selectUser = require('../../model/selectUser');
const createQuestion = require('../../utils/openai/createQuestion');
const createSalutation = require('../../utils/openai/createSalutation');
const uploadBlob = require('../../utils/azureBlob/uploadBlob');
const PdfParse = require('pdf-parse');
const { extractKeyPhrase } = require('../../utils/azureLanguage/keyPhrase');
const insertParagraphs = require('../../model/insertParagraphs');
const updateSalutation = require('../../model/updateSalutation');
const insertConversation_v3 = require('../../model/insertConversation_v3');
const updateConvStatusModel = require('../../model/updateConvStatusModel');
function pageRender(pageArr) {
	return (pageData) => {
		let renderOptions = {
			normalizeWhitespace: true,
		};

		return pageData.getTextContent(renderOptions).then((textContent) => {
			const mappedText = textContent.items.map((item) => item.str).join(' ');
			// console.log('mapped text: ', mappedText);
			pageArr.push(mappedText);
			return mappedText;
			// return {
			// 	pageNumber: pageData.pageNumber,
			// 	text: textContent.items.map((item) => item.str).join(' '),
			// };

			//줄바꿈 될때마다 \n을 추가하는 코드
			// let lastY,
			// 	text = '';
			// for (let item of textContent.items) {
			// 	if (lastY == item.transform[5] || !lastY) {
			// 		text += item.str;
			// 	} else {
			// 		text += '\n' + item.str;
			// 	}
			// 	lastY = item.transform[5];
			// }
			// return text;
		});
	};
	// 텍스트 레이어를 추출합니다.
}
function escapeQuotation(str) {
	return str.replace(/'/g, "''");
}
// async function processArrayInBatches(arr, batchSize) {
// 	const result = [];

// 	for (let i = 0; i < arr.length; i += batchSize) {
// 		const batch = arr.slice(i, i + batchSize);
// 		const batchResult = await extractKeyPhrase(batch);
// 		result.push(...batchResult);
// 	}

// 	return result;
// }
async function processArrayInBatches(arr, batchSize) {
	const batches = [];

	for (let i = 0; i < arr.length; i += batchSize) {
		batches.push(arr.slice(i, i + batchSize));
	}

	try {
		const results = await Promise.all(
			batches.map((batch) => extractKeyPhrase(batch)),
		);
		return results.flat();
	} catch (error) {
		console.error('Error processing array in batches:', error);
		throw error;
	}
}

async function createConversationV5(req, res) {
	const user = req.user;
	console.log('user: ', user);
	let conversationId;
	try {
		//user id 가져오기 req.user에는 userid가 없음. 다른 db이기 떄문
		const selectUserResult = await selectUser({
			email: user.user_email,
			name: user.user_name,
		});
		const userId = selectUserResult.recordset[0]?.user_id;
		if (!userId) {
			res.status(404).send('unknown user id');
			return;
		}
		//upload blob
		const { fileUrl, fields, extension, buffer } = await uploadBlob(req);

		//conversation 생성
		const conversationResult = await insertConversation_v3({
			conversationName: fields.conversationName,
			userId,
			fileUrl,
		});

		conversationId = conversationResult.recordset[0].conversation_id;
		res.status(201).send({
			message: 'conversation created',
			createdId: conversationId,
		});
		//get pdf text && keyphrase of paragraphs
		const pages = [];
		await PdfParse(buffer, {
			pagerender: pageRender(pages),
		});

		// const textArr = document.text.split('\n');
		// const filteredArr = textArr.filter((el) => (el ? true : false)); //빈 페이지 삭제. split 하는 과정에서 빈 string이 하나씩 생김.

		// const extracted = await processArrayInBatches(filteredArr, 25);
		// console.log('textArr: ', textArr);
		// console.log('filtered Arr : ', filteredArr);
		const paragraphs = [];
		for (let i = 0; i < pages.length; i++) {
			paragraphs.push({
				content: escapeQuotation(pages[i]).toLowerCase(),
				// keywords: escapeQuotation(extracted[i].join(', ')),
				order_number: i,
			});
		}

		await insertParagraphs({
			paragraphs,
			conversationId: conversationId,
		});
		//summarize
		// const optimizedText = document.text.replace(/\n/g, '');
		// const summarizedText = await summarization(optimizedText);
		const joinedText = pages.join(' ').slice(0, 2500); //앞에 2500자 까지만 제공
		console.log('joined text for salutation :', joinedText);
		//salutation 생성
		const salutation = await createSalutation(joinedText);
		console.log('salutation: ', salutation);
		await updateSalutation({
			convId: conversationId,
			salutation,
			userId: userId,
		});
		// //초기 메세지 생성
		// const messageDB = generator.systemMessageDB(conversationId, summarizedText);

		//생성된 초기 메세지 삽입
		// await insertMessage(messageDB);
		// const conversationsResult = await selectConversation_all({ userId });
		// const conversations = conversationsResult.recordset;
		//예상 질문 생성 //todo
		const questions = await createQuestion(joinedText);
		const questionArr = questions.split('\n');
		//예상 질문 INSERT
		await insertQuestion({
			conversationId: conversationId,
			questionArr: questionArr,
		});
		console.log('questions: ', questions);
		// res.status(201).send({
		// 	message: 'conversation created',
		// 	createdId: conversationId,
		// });
		await updateConvStatusModel({
			convId: conversationId,
			status: 'created',
			userId: userId,
		});

		console.log('updated conv status');
	} catch (error) {
		console.log('error: ', error);
		await updateConvStatusModel({
			convId: conversationId,
			status: 'error',
		});
	}
}

module.exports = createConversationV5;
