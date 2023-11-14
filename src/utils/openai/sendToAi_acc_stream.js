const { default: OpenAI } = require('openai');
const MessageGenerator = require('../generator');
require('dotenv').config();
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORGANIZATION,
});
//accumulate의 약자. 누적성 메세지. 이전 메세지 기억함
async function sendToAi_acc_stream(
	previousMessages = [],
	newMessage,
	streamCallback,
) {
	if (!configuration.apiKey) {
		return { message: 'no apikey presented', status: false };
	}
	console.log('previous messages : ', previousMessages);
	try {
		previousMessages.push(MessageGenerator.userMessage(newMessage));
		let finalText = '';
		console.log('messages before send to ai : ', previousMessages);
		const completion = await openai.createChatCompletion(
			{
				model: 'gpt-3.5-turbo',
				messages: previousMessages,
				stream: true,
			},
			{
				responseType: 'stream',
			},
		);
		completion.data.on('data', (chunk) => {
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
				streamCallback({
					isEnd: true,
					text: '문자열을 JSON으로 파싱하는 데 실패했습니다',
					error: '문자열을 JSON으로 파싱하는 데 실패했습니다',
				});
			}
			let text = '';
			// console.log('json : ', json);
			if (isIterable(json)) {
				for (let data of json) {
					text += data.choices[0].delta.content || '';
				}
				// console.log('text: ', text);
				finalText += text;

				streamCallback({
					text: text,
					isEnd: false,
				});
			} else {
				console.log('반복 가능한 json 객체가 아닙니다.');
				streamCallback({
					error: '반복 가능한 json 객체가 아닙니다.',
					isEnd: true,
					text: '반복 가능한 json 객체가 아닙니다.',
				});
			}
		});
		completion.data.on('end', () => {
			console.log('text: ', finalText);
			streamCallback({ isEnd: true, text: finalText });
		});
		// messages.push(completion.data.choices[0].message);
		// return {
		// 	messages: messages,
		// 	answer: completion.data.choices[0].message,
		// 	status: true,
		// };
	} catch (error) {
		console.log('error: ', error);
		throw new Error(error.message);
		// return { status: false, error: error.message };
	}
}
function isIterable(obj) {
	return obj != null && typeof obj[Symbol.iterator] === 'function';
}
module.exports = sendToAi_acc_stream;
