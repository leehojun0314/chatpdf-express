const express = require('express');
const authenticateDtizen = require('../../middleware/authenticateDtizen');

const deleteConversation = require('./deleteConversation');
const getConversations = require('./getConversations');
const authenticate = require('../../middleware/authenticate');
const lastConversation = require('./lastConversation');
const changeConvName = require('./changeConvName');
const checkConversation = require('./checkConversation');
const createConversationV7 = require('./createConversation_v7');
const createConversationV8 = require('./createConversation_v8');
const router = express.Router();

router.get('/', authenticate, getConversations);
router.get('/check', authenticate, checkConversation);
// router.post('/', authenticate, createConversation);
// router.post('/v2', authenticate, createConversationV2);
// router.post('/v3', authenticate, createConversationV3);
// router.post('/v4', authenticate, createConversationV4);
// router.post('/v5', authenticate, createConversationV5);
// router.post('/v6', authenticate, createConversationV6);
router.post('/v7', authenticate, createConversationV7);
router.post('/v8', authenticate, createConversationV8);
router.delete('/', authenticate, deleteConversation);
router.patch('/last', authenticate, lastConversation);
router.patch('/name', authenticate, changeConvName);
router.get('/dtizen', authenticateDtizen, getConversations);

module.exports = router;
