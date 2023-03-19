const { Configuration, OpenAIApi } = require('openai');
const MessageGenerator = require('./generator');
require('dotenv').config();
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORGANIZATION,
});
const openai = new OpenAIApi(configuration);
//volatility의 약자. 휘발성 메세지. 이전 메세지 기억못함
async function sendToAi_vola_cb(systemMessage, newMessage, streamCallback) {
	if (!configuration.apiKey) {
		return { message: 'no apikey presented', status: false };
	}
	// const messages = MessageGenerator.messageSet(recordset);
	const messages = [MessageGenerator.systemMessage(systemMessage)];
	try {
		messages.push(MessageGenerator.userMessage(newMessage));
		const completion = await openai.createChatCompletion(
			{
				model: 'gpt-3.5-turbo',
				messages: messages,
				stream: true,
			},
			{
				responseType: 'stream',
			},
		);
		completion.data.on('data', (chunk) => {
			console.log('chunk: ', chunk);
			if (chunk?.toString().includes('[DONE]')) {
				return;
			}
			let chunkToString = chunk.toString();
			console.log('string chunk: ', chunkToString);
			// 1. "data:"를 콤마로 대체합니다.
			let parsableString = chunkToString.replace(/data\s*:/g, ',');
			// 2. 문자열의 시작과 끝에 대괄호를 추가하여 배열로 만듭니다.
			parsableString = '[' + parsableString + ']';
			// 3. 문자열의 첫 번째 콤마를 제거합니다.
			parsableString = parsableString.replace(/^\[,/, '[');
			console.log('parsableString: ', parsableString);
			// 이제 문자열을 JSON.parse로 파싱할 수 있습니다.
			let json;

			try {
				json = JSON.parse(parsableString);
			} catch (e) {
				console.error('문자열을 JSON으로 파싱하는 데 실패했습니다:', e);
			}
			let text = '';
			for (let data of json) {
				console.log('data: ', data);
				text += data.choices[0].delta.content || '';
			}
			console.log('text:', text);
			streamCallback({
				text: text,
				isEnd: false,
			});
		});
		completion.data.on('end', () => {
			streamCallback({ isEnd: true });
		});
		// messages.push(completion.data.choices[0].message);
		// return {
		// 	messages: messages,
		// 	answer: completion.data.choices[0].message,
		// 	status: true,
		// };
	} catch (error) {
		console.log('error: ', error);
		return { status: false, error: error };
	}
}
module.exports = sendToAi_vola_cb;
