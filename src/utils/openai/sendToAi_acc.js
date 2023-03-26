const { Configuration, OpenAIApi } = require('openai');
const MessageGenerator = require('../generator');
require('dotenv').config();
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORGANIZATION,
});
const openai = new OpenAIApi(configuration);
//누적된 메세지도 함께 보내기
async function sendToAi_acc(recordset, newMessage) {
	if (!configuration.apiKey) {
		return { error: 'no apikey presented', status: false };
	}
	try {
		const messages = MessageGenerator.messageSet(recordset);
		messages.push(MessageGenerator.userMessage(newMessage));
		const completion = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: messages,
		});
		console.log(completion.data.choices[0].message);
		messages.push(completion.data.choices[0].message);
		return {
			messages: messages,
			answer: completion.data.choices[0].message,
			status: true,
		};
	} catch (error) {
		return { status: false, error: error };
	}
}
module.exports = sendToAi_acc;
