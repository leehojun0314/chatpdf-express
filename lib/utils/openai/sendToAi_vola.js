"use strict";

const {
  Configuration,
  OpenAIApi
} = require('openai');
const MessageGenerator = require('../generator');
require('dotenv').config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION
});
const openai = new OpenAIApi(configuration);
//volatility의 약자. 휘발성 메세지. 이전 메세지 기억못함
async function sendToAi_vola(systemMessage, newMessage) {
  if (!configuration.apiKey) {
    return {
      message: 'no apikey presented',
      status: false
    };
  }
  // const messages = MessageGenerator.messageSet(recordset);
  const messages = [MessageGenerator.systemMessage(systemMessage)];
  try {
    messages.push(MessageGenerator.userMessage(newMessage));
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages
    });
    console.log(completion.data.choices[0].message);
    messages.push(completion.data.choices[0].message);
    return {
      messages: messages,
      answer: completion.data.choices[0].message,
      status: true
    };
  } catch (error) {
    console.log('error: ', error);
    return {
      status: false,
      error: error
    };
  }
}
module.exports = sendToAi_vola;