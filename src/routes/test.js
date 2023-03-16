const express = require('express');
const getSql = require('../database/connection');
const authenticate = require('../middleware/authenticate');
const selectMessage = require('../model/selectMessage');
const sendToAi = require('../utils/sendToAi');
const router = express.Router();

router.get('/', async (req, res) => {
	const text = req.query.text;
	console.log('text: ', text);
	try {
		const messagesResult = await selectMessage({ conversationId: 7 });
		const { messages, answer } = await sendToAi(
			'넌 상냥한 선생님이야.',
			text,
		);
		res.send({ answer });
	} catch (error) {
		res.send(error);
	}
});

router.get('/:id', authenticate, (req, res) => {
	res.send(`User with ID: ${req.params.id}`);
});

module.exports = router;
