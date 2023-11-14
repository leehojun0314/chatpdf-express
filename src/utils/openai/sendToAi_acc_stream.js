const { default: OpenAI } = require('openai');
const MessageGenerator = require('../generator');
require('dotenv').config();

//accumulate의 약자. 누적성 메세지. 이전 메세지 기억함
async function sendToAi_acc_stream(
	previousMessages = [],
	newMessage,
	streamCallback,
) {
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		organization: process.env.OPENAI_ORGANIZATION,
	});
	console.log('previous messages : ', previousMessages);
	try {
		previousMessages.push(MessageGenerator.userMessage(newMessage));
		let finalText = '';
		console.log('messages before send to ai : ', previousMessages);
		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: previousMessages,
			stream: true,
		});
		for await (const chunk of completion) {
			if (chunk.choices[0].finish_reason === 'stop') {
				streamCallback({ isEnd: true, text: finalText });

				return;
			}
			const text = chunk.choices[0].delta.content;
			finalText += text;
			streamCallback({
				isEnd: false,
				text: text,
			});
		}
	} catch (error) {
		console.log('error: ', error);
		streamCallback({
			isEnd: true,
			text: finalText,
			error: error,
		});
		throw new Error(error.message);
		// return { status: false, error: error.message };
	}
}
function isIterable(obj) {
	return obj != null && typeof obj[Symbol.iterator] === 'function';
}
module.exports = sendToAi_acc_stream;
