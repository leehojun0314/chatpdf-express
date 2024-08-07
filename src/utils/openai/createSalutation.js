const { Configuration, OpenAIApi } = require('openai');
const MessageGenerator = require('../generator');
const generator = require('../generator');
require('dotenv').config();
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORGANIZATION,
});
const openai = new OpenAIApi(configuration);
//volatility의 약자. 휘발성 메세지. 이전 메세지 기억못함
async function createSalutation(allTexts) {
	if (!configuration.apiKey) {
		return { message: 'no apikey presented', status: false };
	}
	try {
		const systemMessage = generator.presetSalutation(allTexts);
		const completion = await openai.createChatCompletion({
			model: 'gpt-4',
			messages: [systemMessage],
			temperature: 1,
		});
		console.log(
			'create salutation token usage: ',
			completion.data.usage.total_tokens,
		);
		const answer = completion.data.choices[0].message.content;
		return answer;
	} catch (error) {
		console.log('error: ', error.response);
		return;
	}
}
module.exports = createSalutation;
