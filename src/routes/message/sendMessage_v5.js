const insertMessage = require('../../model/insertMessage');
const selectMessage = require('../../model/selectMessage');
const selectUser = require('../../model/selectUser');
const sendToAi_vola_stream = require('../../utils/openai/sendToAi__vola_stream');
const selectParagraph_all = require('../../model/selectParagraph_all');
const selectConvIntId = require('../../model/selectConvIntId');
const {
	getRelatedParagraphs_v2,
} = require('../../utils/optimizer/getRelatedParagraphs_v2');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { Document } = require('langchain/document');
const { OpenAI } = require('langchain/llms/openai');
const { VectorDBQAChain } = require('langchain/chains');
const { PineconeClient } = require('@pinecone-database/pinecone');
const configs = require('../../../configs');
require('dotenv').config();
const pineconeClient = new PineconeClient();
async function sendMessageV5(req, res) {
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
		const userResult = await selectUser({
			email: user.user_email,
			name: user.use_name,
			profileImg: user.imgUrl || user.picture || '',
		});
		console.log('user result: ', userResult);
		const userId = userResult.recordset[0].user_id;

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
		console.log('message vector: ', messageVector);
		const vectorStoreResult =
			await vectorStore.similaritySearchVectorWithScore(messageVector, 10, {
				convIntId: Number(convIntId),
			});
		const relatedParagraphs = vectorStoreResult.map((storeResult) => {
			return storeResult[0];
		});
		console.log('relatedParagraphs : ', relatedParagraphs);
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

					await insertMessage({
						message: message,
						sender: 'user',
						messageOrder: messagesResult.recordset.length,
						convIntId: convIntId,
						userId: userId,
					});
					//ai가 보낸 내용 insert
					await insertMessage({
						message:
							text +
							(selectedParagraphs.length > 0
								? `\n(ref : ${selectedParagraphs
										.map((p) => p.metadata.pageNumber)
										.join(', ')} page) `
								: ''),
						sender: 'assistant',
						messageOrder: messagesResult.recordset.length + 1,
						convIntId: convIntId,
						userId: userId,
					});
					res.end('');
				} else {
					// res.write(text);
					res.write(
						JSON.stringify({
							text,
							pages: selectedParagraphs.map(
								(p) => p.metadata.pageNumber,
							),
						}) + '\n',
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

module.exports = sendMessageV5;
