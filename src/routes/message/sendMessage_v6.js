const insertMessage = require('../../model/insertMessage');
const selectMessage = require('../../model/selectMessage');
const sendToAi_vola_stream = require('../../utils/openai/sendToAi__vola_stream');
const selectConvIntId = require('../../model/selectConvIntId');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { PineconeClient } = require('@pinecone-database/pinecone');
const configs = require('../../../configs');
const insertDebate = require('../../model/insertDebate');
require('dotenv').config();
const pineconeClient = new PineconeClient();
function referenceDocsToString(docs) {
	let result = 'Refered : ';

	// group by documentName
	const grouped = docs.reduce((groupedDocs, doc) => {
		if (!groupedDocs[doc.documentName]) {
			groupedDocs[doc.documentName] = [];
		}
		groupedDocs[doc.documentName].push(doc.page);
		return groupedDocs;
	}, {});

	// convert to string
	for (const [docName, pages] of Object.entries(grouped)) {
		const sortedPages = pages.sort((a, b) => a - b);
		result += `\n ${docName} (${sortedPages.join(', ')} page)`;
	}

	return result;
}
async function sendMessageV6(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
	const convStringId = req.body?.conversationId || '';
	const user = req.user;
	const message = req.body?.text;
	console.log('message: ', message);
	if (!convStringId) {
		res.status(404).send('please enter a valid conversation id');
		return;
	}
	try {
		const convIntId = await selectConvIntId({ convStringId: convStringId });
		console.log('user: ', user);
		const userId = user.user_id;
		//get related paragraph from pinecone
		await pineconeClient.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);
		const vectorStore = await PineconeStore.fromExistingIndex(
			new OpenAIEmbeddings(),
			{ pineconeIndex },
		);
		//todo message vector
		const embeddings = new OpenAIEmbeddings();

		const messageVector = await embeddings.embedQuery(message);
		// console.log('message vector: ', messageVector);
		const vectorStoreResult =
			await vectorStore.similaritySearchVectorWithScore(messageVector, 10, {
				convIntId: Number(convIntId),
			});
		console.log('similarity search result: ', vectorStoreResult);
		const filteredStoreResult = vectorStoreResult.filter(
			(storeResult) => storeResult[1] > configs.vectorResultSimilarityScore,
		);
		const relatedParagraphs = filteredStoreResult.map((storeResult) => {
			return storeResult[0];
		});
		// console.log('relatedParagraphs : ', relatedParagraphs);
		const selectedParagraphs = [];
		let totalLength = 0;
		const maxLength = configs.relatedParagraphLength;
		for (const paragraph of relatedParagraphs) {
			if (totalLength + paragraph.pageContent.length <= maxLength) {
				selectedParagraphs.push(paragraph);
				totalLength += paragraph.pageContent.length;
			} else {
				// 남은 길이를 계산하고, 해당 길이만큼 잘라낸 paragraph_content를 저장합니다.
				const remainingLength = maxLength - totalLength;
				const truncatedContent = paragraph.pageContent.substring(
					0,
					remainingLength,
				);
				selectedParagraphs.push({
					...paragraph,
					pageContent: truncatedContent,
				});
				totalLength += truncatedContent.length;
				break;
			}
		}
		const relatedContent = selectedParagraphs
			.map((p) => p.pageContent)
			.join('\n');
		console.log('related Content : ', relatedContent);
		const messagesResult = await selectMessage({
			convIntId,
			userId: userId,
		});
		await sendToAi_vola_stream(
			relatedContent, //지문의 내용
			message,
			async ({ text, isEnd, error }) => {
				if (error) {
					console.log('openai error : ', error);
					res.status(500).send(error);
					return;
				}
				if (isEnd) {
					//내가 보낸 내용 insert

					const insertQuestionRes = await insertMessage({
						message: message,
						sender: 'user',
						convIntId: convIntId,
						userId: userId,
					});
					//ai가 보낸 내용 insert
					const referenceDocs = selectedParagraphs.map((p) => {
						return {
							page: p.metadata.pageNumber,
							documentName: p.metadata.docuName,
						};
					});
					const answer =
						text +
						(selectedParagraphs.length > 0
							? '\n' + referenceDocsToString(referenceDocs)
							: '');
					const insertAnswerRes = await insertMessage({
						message: answer,
						sender: 'assistant',
						convIntId: convIntId,
						userId: userId,
					});
					console.log('insert question res: ', insertQuestionRes);
					console.log('insert answer res :', insertAnswerRes);
					const questionId = insertQuestionRes.recordset[0].message_id;
					const answerId = insertAnswerRes.recordset[0].message_id;

					console.log('assistant message id : ', answerId);
					console.log('question message id : ', questionId);
					await insertDebate({
						questionId,
						answerId,
						referContent: answer,
						convIntId,
						userId,
					});
					res.end('');
				} else {
					// res.write(text);
					res.write(
						JSON.stringify({
							text,
							referenceDocs: selectedParagraphs.map((p) => {
								return {
									page: p.metadata.pageNumber,
									documentName: p.metadata.docuName,
								};
							}),
						}) + '#',
					);
				}
			},
		);

		// const messagesFinalResult = await selectMessage({ conversationId });
	} catch (error) {
		console.log('err: ', error);
		res.status(400).send(error);
	}
}

module.exports = sendMessageV6;
