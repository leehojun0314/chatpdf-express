const express = require('express');
const authenticate = require('../../middleware/authenticate');
const createConversation = require('./createConversation');
const createConversationV2 = require('./createConversation_v2');
const deleteConversation = require('./deleteConversation');
const getConversations = require('./getConversations');
const createConversationV3 = require('./createConversation_v3');
const router = express.Router();

router.get('/', authenticate, getConversations);
router.post('/', authenticate, createConversation);
router.post('/v2', authenticate, createConversationV2);
router.post('/v3', authenticate, createConversationV3);
router.delete('/', authenticate, deleteConversation);
module.exports = router;
