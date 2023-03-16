const express = require('express');
const getSql = require('../database/connection');
const authenticate = require('../middleware/authenticate');
const selectMessage = require('../model/selectMessage');
const router = express.Router();

router.get('/', async (req, res) => {
	const messagesResult = await selectMessage({ conversationId: 7 });
	res.send({ messagesResult });
});

router.get('/:id', authenticate, (req, res) => {
	res.send(`User with ID: ${req.params.id}`);
});

module.exports = router;
