const authenticate = require('../../middleware/authenticate');
const sendMessageV1 = require('./sendMessage_v1');
const sendMessageV2 = require('./sendMessage_v2');
const sendMessageV3 = require('./sendMessage_v3');
const getMessages = require('./getMessages');
const getMessages_v2 = require('./getMessages_v2');
const express = require('express');
const getMessages_v3 = require('./getMessages_v3');
const router = express.Router();

router.get('/', authenticate, getMessages);
router.get('/v2', authenticate, getMessages_v2);
router.get('/v3', authenticate, getMessages_v3);
router.post('/v1', authenticate, sendMessageV1);
router.post('/v2', authenticate, sendMessageV2);
router.post('/v3', authenticate, sendMessageV3);
module.exports = router;
