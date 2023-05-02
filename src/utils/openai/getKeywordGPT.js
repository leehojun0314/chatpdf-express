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
					content: `제시되는 문장에서 키워드를 추출해줘. 키워드에 '페이지' 단어가 포함되어 있으면 영어인 'page'로 바꿔줘.
							문장 : What does Seller mean in the agreement?
                            답 : seller, mean, agreement
							문장 : 10 페이지에 무슨 내용이 있어?
							답 : 10, page
							문장 : 4. GPT-3은 어떤 NLP 데이터셋에서 몇 가지 예시 사항이 있는지?
							답 : GPT-3, NLP, 데이터셋, 예시
							문장 : What does it mean when it says, "Time is of the essence" in the context of the delivery of Goods in this Agreement?
							답 : mean, time, essence, delivery, goods, agreement
                            문장 : ${text} 
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
