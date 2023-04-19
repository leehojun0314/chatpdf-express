const express = require('express');
const insertMessage = require('../../model/insertMessage');
const selectMessage = require('../../model/selectMessage');
const selectUser = require('../../model/selectUser');
const sendToAi_vola_stream = require('../../utils/openai/sendToAi__vola_stream');
const router = express.Router();
async function sendMessageV3(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
	const conversationId = req.body?.conversationId || '';
	const user = req.user;
	const message = req.body?.text;
	if (!conversationId) {
		res.status(404).send('please enter a valid conversation id');
		return;
	}
	try {
		console.log('user: ', user);
		const userResult = await selectUser({
			email: user.user_email,
			name: user.use_name,
		});
		console.log('user result: ', userResult);
		const userId = userResult.recordset[0].user_id;
		const messagesResult = await selectMessage({ conversationId });
		await sendToAi_vola_stream(
			messagesResult.recordset[0].message, //지문의 내용
			message,
			async ({ text, isEnd, error }) => {
				if (error) {
					res.status(500).send(error);
					return;
				}
				if (isEnd) {
					//내가 보낸 내용 insert
					await insertMessage({
						message: message,
						sender: 'user',
						messageOrder: messagesResult.recordset.length,
						conversationId: conversationId,
						userId: userId,
					});
					//ai가 보낸 내용 insert
					await insertMessage({
						message: text,
						sender: 'assistant',
						messageOrder: messagesResult.recordset.length + 1,
						conversationId: conversationId,
						userId: userId,
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

module.exports = sendMessageV3;
