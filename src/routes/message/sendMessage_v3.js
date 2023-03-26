const express = require('express');
// const authenticate = require('../middleware/authenticate');
const insertMessage = require('../../model/insertMessage');
const selectMessage = require('../../model/selectMessage');
const sendToAi_vola_stream = require('../../utils/openai/sendToAi__vola_stream');
const router = express.Router();
async function sendMessageV3(req, res) {
	console.log('req : ', req.body);
	res.setHeader('Content-Type', 'application/json');
	const conversationId = req.body?.conversationId || '';
	const message = req.body?.text;
	if (!conversationId) {
		res.status(404).send('please enter a valid conversation id');
		return;
	}
	try {
		const messagesResult = await selectMessage({ conversationId });
		await sendToAi_vola_stream(
			messagesResult.recordset[0].message,
			message,
			async ({ text, isEnd }) => {
				if (isEnd) {
					//내가 보낸 내용 insert
					await insertMessage({
						message: message,
						sender: 'user',
						messageOrder: messagesResult.recordset.length,
						conversationId: conversationId,
					});
					//ai가 보낸 내용 insert
					await insertMessage({
						message: text,
						sender: 'assistant',
						messageOrder: messagesResult.recordset.length + 1,
						conversationId: conversationId,
					});
					res.status(200).end('');
				} else {
					res.write(text);
				}
			},
		);

		// const messagesFinalResult = await selectMessage({ conversationId });
	} catch (error) {
		console.log('err: ', error);
		res.status(400).send(error);
	}
}
// router.post('/', authenticate, async (req, res) => {
// 	console.log('req : ', req.body);
// 	res.setHeader('Content-Type', 'application/json');
// 	const conversationId = req.body?.conversationId || '';
// 	const message = req.body?.text;
// 	if (!conversationId) {
// 		res.status(404).send('please enter a valid conversation id');
// 		return;
// 	}
// 	try {
// 		const messagesResult = await selectMessage({ conversationId });
// 		await sendToAi_vola_cb(
// 			messagesResult.recordset[0].message,
// 			message,
// 			async ({ text, isEnd }) => {
// 				if (isEnd) {
// 					//내가 보낸 내용 insert
// 					await insertMessage({
// 						message: message,
// 						sender: 'user',
// 						messageOrder: messagesResult.recordset.length,
// 						conversationId: conversationId,
// 					});
// 					//ai가 보낸 내용 insert
// 					await insertMessage({
// 						message: text,
// 						sender: 'assistant',
// 						messageOrder: messagesResult.recordset.length + 1,
// 						conversationId: conversationId,
// 					});
// 					res.status(200).end('');
// 				} else {
// 					res.write(text);
// 				}
// 			},
// 		);

// 		// const messagesFinalResult = await selectMessage({ conversationId });
// 	} catch (error) {
// 		console.log('err: ', error);
// 		res.status(400).send(error);
// 	}
// });

module.exports = sendMessageV3;
