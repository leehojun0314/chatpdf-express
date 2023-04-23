const express = require('express');
const authenticateDtizen = require('../../middleware/authenticateDtizen');

const createConversation = require('./createConversation');
const createConversationV2 = require('./createConversation_v2');
const deleteConversation = require('./deleteConversation');
const getConversations = require('./getConversations');
const createConversationV3 = require('./createConversation_v3');
const authenticate = require('../../middleware/authenticate');
const lastConversation = require('./lastConversation');
const createConversationV4 = require('./createConversation_v4');
const changeConvName = require('./changeConvName');
const router = express.Router();

router.get('/', authenticate, getConversations);
router.post('/', authenticate, createConversation);
router.post('/v2', authenticate, createConversationV2);
router.post('/v3', authenticate, createConversationV3);
router.post('/v4', authenticate, createConversationV4);
router.delete('/', authenticate, deleteConversation);
router.patch('/last', authenticate, lastConversation);
router.patch('/name', authenticate, changeConvName);
router.get('/dtizen', authenticateDtizen, getConversations);

module.exports = router;
