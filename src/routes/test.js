const express = require('express');
const router = express.Router();
const configs = require('../../configs');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
	apiKey: configs.openai.apiKey,
	organization: configs.openai.organization,
});
const openai = new OpenAIApi(configuration);
const { encode, decode } = require('js-base64');
router.post('/', (req, res) => {
	console.log('req: ', req);
});
router.get('/', async (req, res) => {
	const text = req.query.text;
	if (!text) {
		res.send('');
		return;
	}
	const encoded = encode(text);
	console.log('text: ', text);
	console.log('encoded: ', encoded);
	const decoded = decode(encoded);
	console.log('decoded: ', decoded);

	res.send(encode(text));
});

// router.get('/', (req, res) => {
// 	const totalSize = 10000000; // 전체 파일 크기
// 	const chunkSize = 1000000; // 한 번에 보낼 청크 크기
// 	let progress = 0; // 전송된 크기

// 	res.setHeader('Content-Type', 'application/json');
// 	res.setHeader('Content-Length', totalSize);

// 	const sendChunk = () => {
// 		const remainingSize = totalSize - progress;
// 		const chunk = Math.min(chunkSize, remainingSize);
// 		if (chunk <= 0) {
// 			res.end();
// 			return;
// 		}

// 		const data = {
// 			progress: progress,
// 			total: totalSize,
// 		};

// 		res.write(JSON.stringify(data));

// 		progress += chunk;
// 		setTimeout(sendChunk, 1000); // 임의의 시간 간격으로 전송
// 	};

// 	sendChunk();
// });
module.exports = router;
