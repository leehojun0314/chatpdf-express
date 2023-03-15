const { Configuration, OpenAIApi } = require('openai');
const MessageGenerator = require('../utils/generator');
require('dotenv').config();
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORGANIZATION,
});
const openai = new OpenAIApi(configuration);
async function sendToAi(recordset, newMessage) {
	if (!configuration.apiKey) {
		return { message: 'no apikey presented', status: false };
	}
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
}
module.exports = sendToAi;
