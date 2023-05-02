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
const { v4: uuidv4 } = require('uuid');
const insertConv_v4 = require('../../model/insertConv_v4');
const deleteBlob = require('../../utils/azureBlob/deleteBlob');
function generateConvId() {
	const currentTime = Date.now();
	const uniqueId = uuidv4();
	return `${uniqueId}-${currentTime}`;
}
function pageRender(pageArr) {
	return (pageData) => {
		let renderOptions = {
			normalizeWhitespace: true,
		};

		return pageData.getTextContent(renderOptions).then((textContent) => {
			const mappedText = textContent.items.map((item) => item.str).join(' ');
			pageArr.push(mappedText);
			return mappedText;
		});
	};
}
function escapeQuotation(str) {
	return str.replace(/'/g, "''");
}
function getMiddleElements(arr) {
	const length = arr.length;
	let startIndex;

	if (length < 3) {
		return arr;
	} else if (length % 2 === 0) {
		startIndex = length / 2 - 1;
	} else {
		startIndex = Math.floor(length / 2) - 1;
	}

	return arr.slice(startIndex, startIndex + (length % 2 === 0 ? 2 : 3));
}

async function createConversationV6(req, res) {
	const user = req.user;
	console.log('user: ', user);
	let convIntId;
	let convStringId = generateConvId();
	console.log('conv string id : ', convStringId);
	let userId;
	try {
		//user id 가져오기 req.user에는 userid가 없음. 다른 db이기 떄문
		const selectUserResult = await selectUser({
			email: user.user_email,
			name: user.user_name,
		});
		userId = selectUserResult.recordset[0]?.user_id;
		if (!userId) {
			res.status(404).send('unknown user id');
			return;
		}
		//upload blob
		const { fileUrl, fields, buffer } = await uploadBlob(req);

		//conversation 생성
		const conversationResult = await insertConv_v4({
			conversationName: fields.conversationName,
			userId,
			fileUrl,
			convStringId: convStringId,
		});

		convIntId = conversationResult.recordset[0].id;
		console.log('inserted conv int id : ', convIntId);

		//get pdf text
		const pages = [];
		await PdfParse(buffer, {
			pagerender: pageRender(pages),
		});
		//check validated text

		const replacedTexts = pages.join('').replaceAll(' ', '');
		if (!(replacedTexts.length > 0)) {
			console.log("couldn't extract text from the file");
			res.status(500).send("Couldn't extract text from the file");
			await updateConvStatusModel({
				convIntId: convIntId,
				status: 'error',
				userId: userId,
			});
			await deleteBlob(fileUrl);
			return;
		}
		res.status(201).send({
			message: 'conversation created',
			createdId: convIntId,
		});
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
			convIntId: convIntId,
		});
		//summarize
		// const optimizedText = document.text.replace(/\n/g, '');
		// const summarizedText = await summarization(optimizedText);
		const joinedText = pages.join(' ').slice(0, 5000); //앞에 2500자 까지만 제공
		console.log('joined text for salutation :', joinedText);

		//salutation 생성
		const salutation = await createSalutation(joinedText);
		console.log('salutation: ', salutation);
		await updateSalutation({
			convIntId: convIntId,
			salutation,
			userId: userId,
		});

		//예상 질문 생성
		//제목과 부가적인 요소가 없는 중간 지점에서 질문 생성
		console.log('middle pages: ', getMiddleElements(pages));
		const joinedText2 = getMiddleElements(pages).join(' ').slice(0, 5000);
		const questions = await createQuestion(joinedText2);
		const questionArr = questions.split('\n');
		//예상 질문 INSERT
		await insertQuestion({
			convIntId: convIntId,
			questionArr: questionArr,
		});
		console.log('questions: ', questions);
		await updateConvStatusModel({
			convIntId: convIntId,
			status: 'created',
			userId: userId,
		});

		console.log('updated conv status');
	} catch (error) {
		console.log('catch error: ', error);
		await updateConvStatusModel({
			convIntId: convIntId,
			status: 'error',
			userId: userId,
		});
		res.status(500).send(error);
	}
}

module.exports = createConversationV6;
