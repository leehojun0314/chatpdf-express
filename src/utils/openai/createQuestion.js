const { default: OpenAI } = require('openai');
const MessageGenerator = require('../generator');
require('dotenv').config();

//volatility의 약자. 휘발성 메세지. 이전 메세지 기억못함
async function createQuestion(content) {
	// if (!configuration.apiKey) {
	// 	return { message: 'no apikey presented', status: false };
	// }
	// const messages = MessageGenerator.messageSet(recordset);
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		organization: process.env.OPENAI_ORGANIZATION,
	});
	const prompt = MessageGenerator.presetQuestion(content);
	try {
		// const completion = await openai.createChatCompletion({
		// 	model: 'gpt-3.5-turbo',
		// 	messages: [prompt],
		// });
		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [prompt],
		});
		console.log('completion: ', completion);
		const answer = completion.choices[0].message.content;
		return answer;
	} catch (error) {
		console.log('error: ', error);
		return;
	}
}
module.exports = createQuestion;
