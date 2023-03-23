const authenticate = require('../../middleware/authenticate');
const sendMessageV1 = require('./sendMessage_v1');
const sendMessageV2 = require('./sendMessage_v2');
const sendMessageV3 = require('./sendMessage_v3');
const getMessages = require('./getMessages');
const express = require('express');
const router = express.Router();

router.get('/', authenticate, getMessages);
router.post('/v1', authenticate, sendMessageV1);
router.post('/v2', authenticate, sendMessageV2);
router.post('/v3', authenticate, sendMessageV3);
module.exports = router;
