const express = require('express');
const authenticate = require('../middleware/authenticate');
const insertMessage = require('../model/insertMessage');
const selectMessage = require('../model/selectMessage');
const sendToAi = require('../utils/sendToAi');
const router = express.Router();

router.post('/', authenticate, async (req, res) => {
	console.log('req : ', req.body);
	const conversationId = req.body?.conversationId || '';
	const message = req.body?.text;
	if (!conversationId) {
		res.status(404).send('please enter a valid conversation id');
		return;
	}
	try {
		const messagesResult = await selectMessage({ conversationId });
		console.log('flag 2');
		const { messages, answer } = await sendToAi(
			messagesResult.recordset,
			message,
		);
		console.log('flag 3');
		//내가 보낸 내용 insert
		await insertMessage({
			message: message,
			sender: 'user',
			messageOrder: messagesResult.recordset.length,
			conversationId: conversationId,
		});
		//ai가 보낸 내용 insert
		await insertMessage({
			message: answer.content,
			sender: 'assistant',
			messageOrder: messagesResult.recordset.length + 1,
			conversationId: conversationId,
		});
		const messagesFinalResult = await selectMessage({ conversationId });
		console.log('flag 4');
		res.status(200).send({
			messages: messagesFinalResult.recordset,
			answer: answer.content,
		});
	} catch (error) {
		console.log('err: ', error);
		res.status(400).send(error);
	}
});

module.exports = router;
