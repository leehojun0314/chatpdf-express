const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { Document } = require('langchain/document');
const { OpenAI } = require('langchain/llms/openai');
const { VectorDBQAChain } = require('langchain/chains');
const { PineconeClient } = require('@pinecone-database/pinecone');
require('dotenv').config();
async function upsertParagraph_v2({ paragraphs, convIntId, docuId }) {
	const batchSize = 100;
	const batches = [];

	for (let i = 0; i < paragraphs.length; i += batchSize) {
		batches.push(paragraphs.slice(i, i + batchSize));
	}

	try {
		for await (const batch of batches) {
			const result = await upsertBatchParagraphs({
				paragraphs: batch,
				convIntId,
				docuId,
			});
			console.log('upserted result: ', result);
		}
	} catch (error) {
		console.error('Error inserting paragraphs:', error);
		return error;
	}
}
const client = new PineconeClient();
async function upsertBatchParagraphs({ paragraphs, convIntId, docuId }) {
	try {
		await client.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		const docs = paragraphs.map((p) => {
			return new Document({
				pageContent: p.content,
				metadata: {
					pageNumber: p.pageNumber,
					convIntId,
					docuInfo: p.docuInfo,
					docuMeta: p.docuMeta,
					docuId,
					docuName: p.docuName,
				},
			});
		});
		const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

		const result = await PineconeStore.fromDocuments(
			docs,
			new OpenAIEmbeddings(),
			{ pineconeIndex },
		);
		return result;
	} catch (error) {
		return error;
	}
}
module.exports = upsertParagraph_v2;
