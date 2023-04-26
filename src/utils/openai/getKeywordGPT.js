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
async function getKeywordGPT(text) {
	if (!configuration.apiKey) {
		return { message: 'no apikey presented', status: false };
	}
	try {
		const completion = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'user',
					content: `다음 문장에서 키워드를 추출해줘 : What does Seller mean in the agreement?
                            답 : seller, mean, agreement
                            다음 문장에서 키워드를 추출해줘 : ${text} 
                            답 :`,
				},
			],
			temperature: 0,
		});
		const answer = completion.data.choices[0].message.content;
		return answer.split(',');
	} catch (error) {
		console.log('error: ', error.response);
		return;
	}
}
module.exports = getKeywordGPT;
