const express = require('express');
const router = express.Router();
const configs = require('../../configs');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
	apiKey: configs.openai.apiKey,
	organization: configs.openai.organization,
});
const openai = new OpenAIApi(configuration);

router.get('/', async (req, res, next) => {
	try {
		res.setHeader('Content-Type', 'application/json');
		// res.flushHeaders();
		const response = await openai.createChatCompletion(
			{
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: '안녕?' }],
				stream: true,
			},
			{ responseType: 'stream' },
		);
		response.data.on('data', (chunk) => {
			if (chunk?.toString().includes('[DONE]')) {
				return;
			}
			let chunkToString = chunk.toString();

			// 1. "data:"를 콤마로 대체합니다.
			let parsableString = chunkToString.replace(/data\s*:/g, ',');
			// 2. 문자열의 시작과 끝에 대괄호를 추가하여 배열로 만듭니다.
			parsableString = '[' + parsableString + ']';
			// 3. 문자열의 첫 번째 콤마를 제거합니다.
			parsableString = parsableString.replace(/^\[,/, '[');
			// 이제 문자열을 JSON.parse로 파싱할 수 있습니다.
			let json;
			try {
				json = JSON.parse(parsableString);
			} catch (e) {
				console.error('문자열을 JSON으로 파싱하는 데 실패했습니다:', e);
			}
			// const data = JSON.parse(chunk.toString().replaceAll('data: {', '{'));
			let text = '';
			console.log('json: ', json);
			for (let data of json) {
				text += data.choices[0].delta.content || '';
			}
			// const text = json.choices[0].delta.content || '';
			// if (json.choices.length > 1) {
			// 	for (let choice of json.choices) {
			// 		text += choice.delta.content;
			// 	}
			// }
			console.log('text:', text);
			console.log('flag 2');
			res.write(text);
		});
		response.data.on('end', () => {
			console.log('end called');
			res.end();
		});
	} catch (error) {
		console.log('err: ', error);
		res.status(500).send(error);
		next(error);
	}
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
