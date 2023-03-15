const express = require('express');
const authenticate = require('../middleware/authenticate');
const selectMessage = require('../model/selectMessage');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
	const conversationId = req.query.convId || '';
	console.log('conversation Id : ', conversationId);
	if (!conversationId) {
		res.status(404).send('please enter a valid conversation id');
		return;
	}

	try {
		const messagesResult = await selectMessage({ conversationId });
		console.log('messages: ', messagesResult);
		const shiftedMessages = [...messagesResult.recordset];
		shiftedMessages.shift();
		console.log('shifted : ', shiftedMessages);
		res.status(200).json(shiftedMessages);
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
});

module.exports = router;
