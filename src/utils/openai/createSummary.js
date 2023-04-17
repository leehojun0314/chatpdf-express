const { Configuration, OpenAIApi } = require('openai');
const generator = require('../generator');
require('dotenv').config();
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORGANIZATION,
});
const openai = new OpenAIApi(configuration);
//volatility의 약자. 휘발성 메세지. 이전 메세지 기억못함
async function createSummary(text) {
	if (!configuration.apiKey) {
		return { message: 'no apikey presented', status: false };
	}
	const prompt = generator.createSummary(text);
	try {
		const completion = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: [prompt],
		});
		const answer = completion.data.choices[0].message.content;
		return answer;
	} catch (error) {
		console.log('error: ', error.response);
		return;
	}
}
module.exports = createSummary;
