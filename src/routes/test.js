// const express = require('express');
// const router = express.Router();
// const https = require('https');
// const formidable = require('formidable');
// const sendToAi_vola_stream = require('../utils/openai/sendToAi__vola_stream');
// const { v4: uuidv4 } = require('uuid');
// const PdfParse = require('pdf-parse');
// const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
// const { WeaviateStore } = require('langchain/vectorstores/weaviate');
// const { PineconeStore } = require('langchain/vectorstores/pinecone');
// const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
// const { Document } = require('langchain/document');
// const { OpenAI } = require('langchain/llms/openai');
// const { VectorDBQAChain } = require('langchain/chains');
// const { PineconeClient } = require('@pinecone-database/pinecone');
// require('dotenv').config();
// const pineconeClient = new PineconeClient();
// const { Configuration, OpenAIApi } = require('openai');
// const { encode, decode } = require('gpt-3-encoder');
// router.get('/checktoken', async (req, res) => {
// 	try {
// 		const str = '안녕하세요? 반갑습니다';
// 		const encoded = encode(str);
// 		console.log('Encoded this string looks like: ', encoded);

// 		console.log('We can look at each token and what it represents');
// 		let tokenCount = 0;
// 		for (let token of encoded) {
// 			console.log({ token, string: decode([token]) });
// 			tokenCount++;
// 		}
// 		console.log('token count : ', tokenCount);
// 		const decoded = decode(encoded);
// 		console.log('We can decode it back into:\n', decoded);
// 		res.send('hello');
// 	} catch (error) {
// 		res.status(500).send(error);
// 	}
// });
// [
// 	{
// 		role: 'string',
// 		content: 'string',
// 	},
// 	{
// 		role: 'string',
// 		content: 'string',
// 	},
// ];

// router.get('/gptAPItest', async (req, res) => {
// 	try {
// 		const configuration = new Configuration({
// 			apiKey: process.env.OPENAI_API_KEY,
// 			organization: process.env.OPENAI_ORGANIZATION,
// 		});
// 		const openai = new OpenAIApi(configuration);
// 		const response = await openai.createCompletion({
// 			model: 'text-davinci-003',
// 			prompt: `당신은 api로써, 다음 대화를 보고, 사용자의 마지막 질문이 만약 지문을 참고해야 답변 할 수 있는 상황이면, 지문을 찾기 위해 알맞은 질문을 작성해주세요.
// 			대화 : 
// 			user: 1. PBL이란 무엇인가요?
// 			assistant : PBL은 Problem Based Learning의 약어로, 실제적 문제 해결을 통해 학습자의 능동적 학습을 촉진시키기 위한 학습자 중심의 교수·학습 방법입니다. 학생들에게 실제적인 문제를 제시하여 학생들이 상호간에 공동으로 문제 해결 방안을 강구하고, 개별 학습과 협동학습을 통해 문제 해결안을 마련하는 교수·학습 방법입니다.

// 			user : pbl 방식으로 수업을 진행하려고 하는데, 커리큘럼을 짜줄래?
			
// 			`,
// 			// messages: [

// 			// {
// 			// 	role: 'user',
// 			// 	content: '1. PBL이란 무엇인가요?',
// 			// },
// 			// {
// 			// 	role: 'assistant',
// 			// 	content:
// 			// 		'PBL은 Problem Based Learning의 약어로, 실제적 문제 해결을 통해 학습자의 능동적 학습을 촉진시키기 위한 학습자 중심의 교수·학습 방법입니다. 학생들에게 실제적인 문제를 제시하여 학생들이 상호간에 공동으로 문제 해결 방안을 강구하고, 개별 학습과 협동학습을 통해 문제 해결안을 마련하는 교수·학습 방법입니다.',
// 			// },
// 			// {
// 			// 	role: 'user',
// 			// 	content:
// 			// 		'pbl 방식으로 수업을 진행하려고 하는데, 커리큘럼을 짜줄래?',
// 			// },
// 			// {
// 			// 	role: 'assistant',
// 			// 	content: `제가 커리큘럼을 작성해 드리는 것은 불가능합니다. 그러나, PBL 수업 커리큘럼을 구성할 때는 다음과 같은 요소를 고려할 수 있습니다.

// 			// 	1. 문제 제시: 예제, 시나리오, 실생활 문제 등을 활용하여 학생들이 스스로 문제를 파악할 수 있도록 도와주는 단계입니다.
// 			// 	2. 문제 이해: 학생들이 문제에 대해 자세히 이해하고 불필요한 정보를 걸러내는 것을 돕는 것입니다.
// 			// 	3. 학습 목표 도출: 학생들이 자신들이 학습하고자 하는 것에 대해 명확한 목표를 설정할 수 있도록 도와주는 단계입니다.
// 			// 	4. 과제 수행 계획 수립: 과제를 수행하면서 어떤 절차를 따라야 하는지, 그리고 각자의 역할이 무엇인지 등을 명확하게 설정하는 단계입니다.
// 			// 	5. 문제 해결 모색: 팀별로 문제 해결책을 모색하고 정보를 공유하는 단계입니다.
// 			// 	6. 결과 정리: 개별과 팀별 결과물을 종합하여 가시적인 결과물을 도출하는 단계입니다.
// 			// 	7. 발표 및 평가: 학생들이 문제 해결과정 및 결과물에 대해 발표하고, 평가하여 총체적인 학습을 달성하는 단계입니다.

// 			// 	각각의 단계는 상호 연결되어 있으며, 수업 별로 상황에 맞게 조절될 수 있습니다.`,
// 			// },
// 			// {
// 			// 	role: 'user',
// 			// 	content: '발표 및 평가에 대해 더 자세히 설명해줄래?',
// 			// },
// 			// ],
// 			temperature: 0.6,
// 		});
// 		openai.createFile;
// 		// const choices = completion.data.choices;
// 		// console.log('choices: ', choices);
// 		// const answer = choices[0].message;
// 		const choices = response.data.choices;
// 		console.log('choices: ', choices);
// 		const answer = choices[0].text;
// 		res.send(answer);
// 	} catch (error) {
// 		console.log(error);
// 		res.send(error.message);
// 	}
// });

// router.get('/createPinecone', async (req, res) => {
// 	console.log('apikey: ', process.env.PINECONE_API_KEY);
// 	console.log('environment:', process.env.PINECONE_ENVIRONMENT);
// 	try {
// 		const initResult = await pineconeClient.init({
// 			apiKey: process.env.PINECONE_API_KEY,
// 			environment: process.env.PINECONE_ENVIRONMENT,
// 		});
// 		console.log('init result : ', initResult);
// 		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);
// 		console.log('pinecone index: ', pineconeIndex);
// 		const indexesList = await pineconeClient.listIndexes();
// 		console.log('indexes list: ', indexesList);
// 		const docs = [
// 			new Document({
// 				metadata: { foo: 'bar' },
// 				pageContent: 'pinecone is a vector db',
// 			}),
// 			new Document({
// 				metadata: { foo: 'bar', baz: 'qux' },
// 				pageContent: 'the quick brown fox jumped over the lazy dog',
// 			}),
// 			new Document({
// 				metadata: { baz: 'qux' },
// 				pageContent: 'lorem ipsum dolor sit amet',
// 			}),
// 			new Document({
// 				metadata: { baz: 'qux' },
// 				pageContent:
// 					'pinecones are the woody fruiting body and of a pine tree',
// 			}),
// 		];
// 		const result = await PineconeStore.fromDocuments(
// 			docs,
// 			new OpenAIEmbeddings(),
// 			{
// 				pineconeIndex,
// 			},
// 		);
// 		console.log('create result : ', result);
// 		res.send('created docs index');
// 	} catch (error) {
// 		console.log('error: ', error);
// 		res.status(500).send(error);
// 	}
// });
// router.get('/queryIndex', async (req, res) => {
// 	const convIntId = req.query.convIntId;
// 	const pageNumber = req.query.pageNumber;
// 	console.log('conv id : ', convIntId);
// 	try {
// 		await pineconeClient.init({
// 			apiKey: process.env.PINECONE_API_KEY,
// 			environment: process.env.PINECONE_ENVIRONMENT,
// 		});
// 		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);

// 		// const vectorStore = await PineconeStore.fromExistingIndex(
// 		// 	new OpenAIEmbeddings(),
// 		// 	{ pineconeIndex },
// 		// );
// 		// const results = await vectorStore.similaritySearch('', 100, {
// 		// 	convIntId: Number(convIntId),
// 		// });
// 		const queryResult = await pineconeIndex.query({
// 			vector: [0.1, 0.2, 0.3, 0.4],
// 			topK: 10,
// 			includeValues: true,
// 			includeMetadata: true,
// 		});

// 		// const queryResponse = await pineconeIndex.query({ queryRequest });
// 		console.log('query res: ', queryResult);
// 		res.send(queryResult);
// 	} catch (error) {
// 		console.log('error: ', error);
// 		res.status(500).send(error);
// 	}
// });
// router.get('/queryEmbeddings', async (req, res) => {
// 	const convIntId = req.query.convIntId;
// 	const message = req.query.message || '';
// 	console.log('conv id : ', convIntId);
// 	try {
// 		await pineconeClient.init({
// 			apiKey: process.env.PINECONE_API_KEY,
// 			environment: process.env.PINECONE_ENVIRONMENT,
// 		});
// 		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);

// 		const vectorStore = await PineconeStore.fromExistingIndex(
// 			new OpenAIEmbeddings(),
// 			{ pineconeIndex },
// 		);
// 		const embeddings = new OpenAIEmbeddings();
// 		const queryVector = await embeddings.embedQuery(message);
// 		const results = await vectorStore.similaritySearchVectorWithScore(
// 			queryVector,
// 			100,
// 			// {
// 			// 	convIntId: Number(convIntId),
// 			// },
// 		);

// 		console.log(results);
// 		// const queryResponse = await pineconeIndex.query({ queryRequest });
// 		console.log('query res: ', results);
// 		res.send(results);
// 	} catch (error) {
// 		console.log('error: ', error);
// 		res.status(500).send(error);
// 	}
// });
// router.get('/deleteVector', async (req, res) => {
// 	try {
// 		await pineconeClient.init({
// 			apiKey: process.env.PINECONE_API_KEY,
// 			environment: process.env.PINECONE_ENVIRONMENT,
// 		});
// 		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);
// 		console.log('pinecone index: ', pineconeIndex);
// 		const deleteRes = await pineconeIndex._delete({
// 			deleteRequest: {
// 				filter: {
// 					baz: { $eq: 'qux' },
// 				},
// 			},
// 		});
// 		console.log('delete res: ', deleteRes);
// 		res.send('ok');
// 	} catch (error) {
// 		console.log('delete error: ', error);
// 		res.status(500).send(error);
// 	}
// });
// router.get('/queryPinecone', async (req, res) => {
// 	const message = req.query.message;
// 	const convIntId = req.query.convIntId;
// 	console.log('message:', message);
// 	try {
// 		await pineconeClient.init({
// 			apiKey: process.env.PINECONE_API_KEY,
// 			environment: process.env.PINECONE_ENVIRONMENT,
// 		});
// 		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);

// 		const vectorStore = await PineconeStore.fromExistingIndex(
// 			new OpenAIEmbeddings(),
// 			{ pineconeIndex },
// 		);
// 		/* Search the vector DB independently with meta filters */
// 		// const results = await vectorStore.similaritySearch('', 1, {
// 		// 	convIntId: 330,
// 		// });
// 		// console.log(results);
// 		/*
// 		  [
// 			Document {
// 			  pageContent: 'pinecone is a vector db',
// 			  metadata: { foo: 'bar' }
// 			}
// 		  ]
// 		  */

// 		/* Use as part of a chain (currently no metadata filters) */
// 		const model = new OpenAI({
// 			temperature: 1.5,
// 		});
// 		const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
// 			k: 1,
// 			returnSourceDocuments: true,
// 		});
// 		const response = await chain.call({
// 			query: message,
// 			filter: {
// 				convIntId: Number(convIntId),
// 			},
// 		});
// 		console.log(response);
// 		res.send(response);
// 	} catch (err) {
// 		console.log('err: ', err);
// 		res.status(500).send(err);
// 	}
// });

// const weaviate = require('weaviate-ts-client');

// const weaviateClient = weaviate.client({
// 	scheme: process.env.WEAVIATE_SCHEME || 'https',
// 	host: process.env.WEAVIATE_HOST || 'localhost',
// 	apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || 'default'),
// });
// function pageRender(pageArr, convId) {
// 	return (pageData) => {
// 		let renderOptions = {
// 			normalizeWhitespace: true,
// 		};
// 		return pageData.getTextContent(renderOptions).then((textContent) => {
// 			const mappedText = textContent.items.map((item) => item.str).join('');
// 			pageArr.push({
// 				content: mappedText,
// 				metadata: {
// 					pageIndex: pageData.pageIndex,
// 					convId,
// 				},
// 			});
// 			return '';
// 		});
// 	};
// 	// 텍스트 레이어를 추출합니다.
// }

// router.get('/schema', (req, res) => {
// 	try {
// 		weaviateClient.schema
// 			.getter()
// 			.do()
// 			.then((schemaRes) => {
// 				console.log('schemares: ', schemaRes);
// 				res.send(schemaRes);
// 			});
// 	} catch (error) {
// 		console.log('error: ', error);
// 		res.status(500).send(error);
// 	}
// });

// router.get('/insertData', async (req, res) => {
// 	const fileUrl = `https://jemishome.blob.core.windows.net/blob/1682954154499-d7662624684e5c04c36c41701`;
// 	try {
// 		// const loader = new CheerioWebBaseLoader(fileUrl);
// 		const loader = new PDFLoader('src/example/awk_manual.pdf');
// 		const docs = await loader.load();
// 		const client = weaviate.client({
// 			scheme: process.env.WEAVIATE_SCHEME || 'https',
// 			host: process.env.WEAVIATE_HOST || 'localhost',
// 			apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || 'default'),
// 		});
// 		// const createStoreResult = await WeaviateStore.fromTexts(
// 		// 	['hello world2', 'hi there2', 'how are you2', 'bye now2'],
// 		// 	new OpenAIEmbeddings(),
// 		// 	{
// 		// 		client,
// 		// 		indexName: 'Test2',
// 		// 		textKey: 'text',
// 		// 		metadataKeys: ['foo'],
// 		// 	},
// 		// );
// 		const createStoreResult = await WeaviateStore.fromDocuments(
// 			docs,
// 			new OpenAIEmbeddings(),
// 			{
// 				client,
// 				indexName: 'DocTest',
// 				textKey: 'content',
// 			},
// 		);
// 		console.log('create store result: ', createStoreResult);
// 		res.send(createStoreResult);
// 	} catch (error) {
// 		console.log('error: ', error);
// 		res.status(500).send(error);
// 	}
// });
// router.get('/queryData', async (req, res) => {
// 	const question = req.query.question || '';
// 	try {
// 		const client = weaviate.client({
// 			scheme: process.env.WEAVIATE_SCHEME || 'https',
// 			host: process.env.WEAVIATE_HOST || 'localhost',
// 			apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || 'default'),
// 		});
// 		const store = await WeaviateStore.fromExistingIndex(
// 			new OpenAIEmbeddings(),
// 			{
// 				client,
// 				indexName: 'DocTest',
// 			},
// 		);

// 		// Search the index without any filters
// 		const results = await store.similaritySearchWithScore(question, 3);
// 		console.log(results);
// 		// const results3 = await store.similaritySearchVectorWithScore();

// 		console.log(results);
// 		res.send(results);
// 	} catch (error) {
// 		console.log('error: ', error);
// 		res.status(500).send(error);
// 	}
// });
// router.get('/docuinfo2', async (req, res) => {
// 	try {
// 		const loader = new PDFLoader('src/example/testqt.pdf');
// 		const docs = await loader.load();
// 		res.send(docs);
// 	} catch (error) {
// 		console.log('error: ', error);
// 		res.status(500).send(error);
// 	}
// });
// router.get('/docuinfo', async (req, res) => {
// 	try {
// 	} catch (error) {}
// });
// function generateConvId() {
// 	const currentTime = Date.now();
// 	const uniqueId = uuidv4();
// 	return `${uniqueId}-${currentTime}`;
// }
// async function processArrayInBatches(arr, batchSize, processor) {
// 	const result = [];
// 	for (let i = 0; i < arr.length; i += batchSize) {
// 		const batch = arr.slice(i, i + batchSize);
// 		const processedData = await processor(batch);
// 		result.push(processedData);
// 	}

// 	return { keyphrasesResult, summarizationsResult };
// }

// router.get('/pagination', (req, res) => {
// 	console.log('pagination');
// 	// const fileUrl =
// 	// 	'https://jemishome.blob.core.windows.net/blob/1682579274354-ce2fbc6df38e2ac7e2812e400'; //언론관
// 	const fileUrl =
// 		'https://jemishome.blob.core.windows.net/blob/1682580377970-3bd8a6a99452f73102b878a00';
// 	https.get(fileUrl, (parseRes) => {
// 		let data = [];

// 		parseRes.on('data', (chunk) => {
// 			data.push(chunk);
// 		});
// 		parseRes.on('end', () => {
// 			const buffer = Buffer.concat(data);
// 			const pages = [];
// 			PdfParse(buffer, { pagerender: pageRender(pages) })
// 				.then((document) => {
// 					console.log('document: ', document);
// 					console.log('pages:', pages);
// 					const textArr = document.text.split('\n\n');

// 					res.send({ pages, text: document.text });
// 				})
// 				.catch((error) => {
// 					console.error('Error while parsing PDF:', error);
// 					res.send(error);
// 				});
// 		});
// 	});
// });
// router.get('/', (req, res) => {
// 	console.log('hello');
// 	res.send('world');
// });

// module.exports = router;
