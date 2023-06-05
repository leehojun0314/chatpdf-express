const express = require('express');
const authenticate = require('../../middleware/authenticate');
const getMessages = require('./getMessages');
const sendMessage = require('./sendMessage');
const router = express.Router();
router.get('/message', authenticate, getMessages);
router.post('/message', authenticate, sendMessage);
module.exports = router;
