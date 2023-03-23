const express = require('express');
const authenticate = require('../../middleware/authenticate');
const createConversation = require('./createConversation');
const getConversations = require('./getConversations');
const router = express.Router();

router.get('/', authenticate, getConversations);
router.post('/', authenticate, createConversation);
module.exports = router;
