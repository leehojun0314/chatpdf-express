const express = require('express');
const router = express.Router();
const https = require('https');
const formidable = require('formidable');
const sendToAi_vola_stream = require('../utils/openai/sendToAi__vola_stream');
const { v4: uuidv4 } = require('uuid');
const PdfParse = require('pdf-parse');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { WeaviateStore } = require('langchain/vectorstores/weaviate');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { Document } = require('langchain/document');
const { OpenAI } = require('langchain/llms/openai');
const { VectorDBQAChain } = require('langchain/chains');
const { PineconeClient } = require('@pinecone-database/pinecone');
require('dotenv').config();
const pineconeClient = new PineconeClient();
router.get('/createPinecone', async (req, res) => {
	console.log('apikey: ', process.env.PINECONE_API_KEY);
	console.log('environment:', process.env.PINECONE_ENVIRONMENT);
	try {
		const initResult = await pineconeClient.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		console.log('init result : ', initResult);
		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);
		console.log('pinecone index: ', pineconeIndex);
		const indexesList = await pineconeClient.listIndexes();
		console.log('indexes list: ', indexesList);
		const docs = [
			new Document({
				metadata: { foo: 'bar' },
				pageContent: 'pinecone is a vector db',
			}),
			new Document({
				metadata: { foo: 'bar' },
				pageContent: 'the quick brown fox jumped over the lazy dog',
			}),
			new Document({
				metadata: { baz: 'qux' },
				pageContent: 'lorem ipsum dolor sit amet',
			}),
			new Document({
				metadata: { baz: 'qux' },
				pageContent:
					'pinecones are the woody fruiting body and of a pine tree',
			}),
		];
		const result = await PineconeStore.fromDocuments(
			docs,
			new OpenAIEmbeddings(),
			{
				pineconeIndex,
			},
		);
		console.log('create result : ', result);
		res.send('created docs index');
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
});
router.get('/queryIndex', async (req, res) => {
	const convIntId = req.query.convIntId;
	const pageNumber = req.query.pageNumber;
	console.log('conv id : ', convIntId);
	try {
		await pineconeClient.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);

		// const vectorStore = await PineconeStore.fromExistingIndex(
		// 	new OpenAIEmbeddings(),
		// 	{ pineconeIndex },
		// );
		// const results = await vectorStore.similaritySearch('', 100, {
		// 	convIntId: Number(convIntId),
		// });
		const queryResult = await pineconeIndex.query({
			vector: [0.1, 0.2, 0.3, 0.4],
			topK: 10,
			includeValues: true,
			includeMetadata: true,
		});

		// const queryResponse = await pineconeIndex.query({ queryRequest });
		console.log('query res: ', queryResult);
		res.send(queryResult);
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
});
router.get('/queryEmbeddings', async (req, res) => {
	const convIntId = req.query.convIntId;
	const message = req.query.message || '';
	console.log('conv id : ', convIntId);
	try {
		await pineconeClient.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);

		const vectorStore = await PineconeStore.fromExistingIndex(
			new OpenAIEmbeddings(),
			{ pineconeIndex },
		);
		const embeddings = new OpenAIEmbeddings();
		const queryVector = await embeddings.embedQuery(message);
		const results = await vectorStore.similaritySearchVectorWithScore(
			queryVector,
			100,
			// {
			// 	convIntId: Number(convIntId),
			// },
		);

		console.log(results);
		// const queryResponse = await pineconeIndex.query({ queryRequest });
		console.log('query res: ', results);
		res.send(results);
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
});
router.get('/deleteVector', async (req, res) => {
	try {
		await pineconeClient.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);
		const vectorStore = await PineconeStore.fromExistingIndex(
			new OpenAIEmbeddings(),
			{ pineconeIndex },
		);
		pineconeIndex.delete1({
			ids: [],
		});
	} catch (error) {}
});
router.get('/queryPinecone', async (req, res) => {
	const message = req.query.message;
	const convIntId = req.query.convIntId;
	console.log('message:', message);
	try {
		await pineconeClient.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);

		const vectorStore = await PineconeStore.fromExistingIndex(
			new OpenAIEmbeddings(),
			{ pineconeIndex },
		);
		/* Search the vector DB independently with meta filters */
		// const results = await vectorStore.similaritySearch('', 1, {
		// 	convIntId: 330,
		// });
		// console.log(results);
		/*
		  [
			Document {
			  pageContent: 'pinecone is a vector db',
			  metadata: { foo: 'bar' }
			}
		  ]
		  */

		/* Use as part of a chain (currently no metadata filters) */
		const model = new OpenAI({
			temperature: 1.5,
		});
		const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
			k: 1,
			returnSourceDocuments: true,
		});
		const response = await chain.call({
			query: message,
			filter: {
				convIntId: Number(convIntId),
			},
		});
		console.log(response);
		res.send(response);
	} catch (err) {
		console.log('err: ', err);
		res.status(500).send(err);
	}
});

const weaviate = require('weaviate-ts-client');

const weaviateClient = weaviate.client({
	scheme: process.env.WEAVIATE_SCHEME || 'https',
	host: process.env.WEAVIATE_HOST || 'localhost',
	apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || 'default'),
});
function pageRender(pageArr, convId) {
	return (pageData) => {
		let renderOptions = {
			normalizeWhitespace: true,
		};
		return pageData.getTextContent(renderOptions).then((textContent) => {
			const mappedText = textContent.items.map((item) => item.str).join('');
			pageArr.push({
				content: mappedText,
				metadata: {
					pageIndex: pageData.pageIndex,
					convId,
				},
			});
			return '';
		});
	};
	// 텍스트 레이어를 추출합니다.
}

router.get('/schema', (req, res) => {
	try {
		weaviateClient.schema
			.getter()
			.do()
			.then((schemaRes) => {
				console.log('schemares: ', schemaRes);
				res.send(schemaRes);
			});
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
});

router.get('/insertData', async (req, res) => {
	const fileUrl = `https://jemishome.blob.core.windows.net/blob/1682954154499-d7662624684e5c04c36c41701`;
	try {
		// const loader = new CheerioWebBaseLoader(fileUrl);
		const loader = new PDFLoader('src/example/awk_manual.pdf');
		const docs = await loader.load();
		const client = weaviate.client({
			scheme: process.env.WEAVIATE_SCHEME || 'https',
			host: process.env.WEAVIATE_HOST || 'localhost',
			apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || 'default'),
		});
		// const createStoreResult = await WeaviateStore.fromTexts(
		// 	['hello world2', 'hi there2', 'how are you2', 'bye now2'],
		// 	new OpenAIEmbeddings(),
		// 	{
		// 		client,
		// 		indexName: 'Test2',
		// 		textKey: 'text',
		// 		metadataKeys: ['foo'],
		// 	},
		// );
		const createStoreResult = await WeaviateStore.fromDocuments(
			docs,
			new OpenAIEmbeddings(),
			{
				client,
				indexName: 'DocTest',
				textKey: 'content',
			},
		);
		console.log('create store result: ', createStoreResult);
		res.send(createStoreResult);
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
});
router.get('/queryData', async (req, res) => {
	const question = req.query.question || '';
	try {
		const client = weaviate.client({
			scheme: process.env.WEAVIATE_SCHEME || 'https',
			host: process.env.WEAVIATE_HOST || 'localhost',
			apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || 'default'),
		});
		const store = await WeaviateStore.fromExistingIndex(
			new OpenAIEmbeddings(),
			{
				client,
				indexName: 'DocTest',
			},
		);

		// Search the index without any filters
		const results = await store.similaritySearchWithScore(question, 3);
		console.log(results);
		// const results3 = await store.similaritySearchVectorWithScore();

		console.log(results);
		res.send(results);
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
});
router.get('/docuinfo2', async (req, res) => {
	try {
		const loader = new PDFLoader('src/example/testqt.pdf');
		const docs = await loader.load();
		res.send(docs);
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
});
router.get('/docuinfo', async (req, res) => {
	try {
	} catch (error) {}
});
function generateConvId() {
	const currentTime = Date.now();
	const uniqueId = uuidv4();
	return `${uniqueId}-${currentTime}`;
}
async function processArrayInBatches(arr, batchSize, processor) {
	const result = [];
	for (let i = 0; i < arr.length; i += batchSize) {
		const batch = arr.slice(i, i + batchSize);
		const processedData = await processor(batch);
		result.push(processedData);
	}

	return { keyphrasesResult, summarizationsResult };
}

router.get('/pagination', (req, res) => {
	console.log('pagination');
	// const fileUrl =
	// 	'https://jemishome.blob.core.windows.net/blob/1682579274354-ce2fbc6df38e2ac7e2812e400'; //언론관
	const fileUrl =
		'https://jemishome.blob.core.windows.net/blob/1682580377970-3bd8a6a99452f73102b878a00';
	https.get(fileUrl, (parseRes) => {
		let data = [];

		parseRes.on('data', (chunk) => {
			data.push(chunk);
		});
		parseRes.on('end', () => {
			const buffer = Buffer.concat(data);
			const pages = [];
			PdfParse(buffer, { pagerender: pageRender(pages) })
				.then((document) => {
					console.log('document: ', document);
					console.log('pages:', pages);
					const textArr = document.text.split('\n\n');

					res.send({ pages, text: document.text });
				})
				.catch((error) => {
					console.error('Error while parsing PDF:', error);
					res.send(error);
				});
		});
	});
});
router.get('/', (req, res) => {
	console.log('hello');
	res.send('world');
});

module.exports = router;
