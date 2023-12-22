const sendToAi_acc_stream = require('../../utils/openai/sendToAi_acc_stream');
const selectDebateMessage = require('../../model/selectDebateMesages');
const generator = require('../../utils/generator');
const insertDebateMessage = require('../../model/insertDebateMessage');
const selectDebate = require('../../model/selectDebate');
const selectConvIntId = require('../../model/selectConvIntId');
const { optimizingPrompt } = require('../../utils/functions');
const configs = require('../../../configs');
require('dotenv').config();

async function sendMessage(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
	const debateId = req.body?.debateId || '';
	const convStringId = req.body?.convStringId || '';
	const message = req.body?.text;
	const answerId = req.body?.answerId;
	const user = req.user;
	console.log('send debate message: ', message);
	if (!debateId || !convStringId) {
		res.status(404).send('please enter a valid debate id');
		return;
	}
	try {
		const convIntId = await selectConvIntId({ convStringId });
		const userId = user.user_id;
		const debateRes = await selectDebate({ answerId, userId });
		console.log('debate res: ', debateRes);
		const debate = debateRes.recordset[0];
		const debateMessagesRes = await selectDebateMessage({ debateId, userId });
		console.log('debate message res: ', debateMessagesRes);
		const debateMessages = debateMessagesRes.recordset;
		console.log('debate messages: ', debateMessages);
		const previousMessages = [];
		const systemMessage = generator.systemMessage(debate.refer_content);
		previousMessages.push(systemMessage);
		previousMessages.push(generator.userMessage(debate.question_content));
		previousMessages.push(generator.assistantMessage(debate.answer_content));
		const optimizedHistory = optimizingPrompt(
			debateMessages,
			debate.refer_content + debate.question_content + debate.answer_content,
			configs.promptTokenLimit,
		);
		previousMessages.concat(
			optimizedHistory.map((debateMessage) => {
				switch (debateMessage.sender) {
					case 'user': {
						return generator.userMessage(debateMessage.content);
					}
					case 'assistant': {
						return generator.assistantMessage(debateMessage.content);
					}
					default: {
						return {};
					}
				}
			}),
		);
		console.log('previous messages: ', previousMessages);
		await sendToAi_acc_stream(
			previousMessages,
			message,
			async ({ text, isEnd, error }) => {
				if (error) {
					console.log('openai error : ', error);
					res.status(500).send(error);
					return;
				}
				if (isEnd) {
					//내가 보낸 내용 insert
					await insertDebateMessage({
						content: message,
						sender: 'user',
						convIntId,
						userId,
						debateId,
					});

					//ai가 보낸 내용 insert
					await insertDebateMessage({
						content: text,
						sender: 'assistant',
						convIntId,
						userId,
						debateId,
					});

					res.end('');
				} else {
					// res.write(text);
					res.write(text);
				}
			},
		);

		// const messagesFinalResult = await selectMessage({ conversationId });
	} catch (error) {
		console.log('send debate err: ', error);
		res.status(400).send(error);
	}
}

module.exports = sendMessage;
