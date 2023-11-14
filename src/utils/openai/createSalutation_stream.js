const { default: OpenAI } = require('openai');
const generator = require('../generator');
require('dotenv').config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORGANIZATION,
});
function isIterable(obj) {
	return obj != null && typeof obj[Symbol.iterator] === 'function';
}
async function createSalutation_stream(allTexts, streamCallback) {
	if (!configuration.apiKey) {
		return { message: 'no apikey presented', status: false };
	}
	let finalText = '';
	try {
		const systemMessage = generator.presetSalutation(allTexts);
		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [systemMessage],
			temperature: 1,
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
		throw new Error(error);
	}
}
module.exports = createSalutation_stream;
