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
const createConversationV9 = require('./createConversation_v9');
const checkConversationV2 = require('./checkConversation_v2');
const addFiles = require('./addFile');
const deleteFiles = require('./deleteFiles');
const addFiles_v2 = require('./addFile_v2');
const createConversationV10 = require('./createConversation_v10');
const router = express.Router();

router.get('/', authenticate, getConversations);
router.get('/check', authenticate, checkConversation);
router.get('/check/v2', authenticate, checkConversationV2);
// router.post('/', authenticate, createConversation);
// router.post('/v2', authenticate, createConversationV2);
// router.post('/v3', authenticate, createConversationV3);
// router.post('/v4', authenticate, createConversationV4);
// router.post('/v5', authenticate, createConversationV5);
// router.post('/v6', authenticate, createConversationV6);
router.post('/v7', authenticate, createConversationV7);
router.post('/v8', authenticate, createConversationV8);
router.post('/v9', authenticate, createConversationV9);
router.post('/v10', authenticate, createConversationV10);
router.delete('/', authenticate, deleteConversation);
router.patch('/last', authenticate, lastConversation);
router.patch('/name', authenticate, changeConvName);

//file control
router.post('/add', authenticate, addFiles);
router.post('/add/v2', authenticate, addFiles_v2);
router.delete('/file', authenticate, deleteFiles);

//dtizen
router.get('/dtizen', authenticateDtizen, getConversations);
router.get('/dtizen/check/v2', authenticateDtizen, checkConversationV2);
router.post(
	'/dtizen/createConversation',
	authenticateDtizen,
	createConversationV9,
);
module.exports = router;
