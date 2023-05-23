const authenticateDtizen = require('../../middleware/authenticateDtizen');
// const sendMessageV1 = require('./sendMessage_v1');
// const sendMessageV2 = require('./sendMessage_v2');
// const sendMessageV3 = require('./sendMessage_v3');
const getMessages = require('./getMessages');
// const getMessages_v2 = require('./getMessages_v2');
const express = require('express');
// const getMessages_v3 = require('./getMessages_v3');
const authenticate = require('../../middleware/authenticate');
const sendMessageV4 = require('./sendMessage_v4');
const getMessages_v4 = require('./getMessages_v4');
const getSalutation = require('./getSalutation');
const getQuestions = require('./getQuestion');
const sendMessageV5 = require('./sendMessage_v5');
const getQuestionsV2 = require('./getQuestion_v2');
const router = express.Router();

// router.get('/', authenticate, getMessages);
// router.get('/v2', authenticate, getMessages_v2);
// router.get('/v3', authenticate, getMessages_v3);
router.get('/v4', authenticate, getMessages_v4);
// router.post('/v1', authenticate, sendMessageV1);
// router.post('/v2', authenticate, sendMessageV2);
// router.post('/v3', authenticate, sendMessageV3);
router.post('/v4', authenticate, sendMessageV4);
router.post('/v5', authenticate, sendMessageV5);
router.get('/salutation', authenticate, getSalutation);
router.get('/questions', authenticate, getQuestions);
router.get('/questions/v2', authenticate, getQuestionsV2);

router.get('/dtizen', authenticateDtizen, getMessages);
// router.get('/v3/dtizen', authenticateDtizen, getMessages_v3);
router.get('/v4/dtizen', authenticateDtizen, getMessages_v4);

// router.post('/v3/dtizen', authenticateDtizen, sendMessageV3);
router.post('/v4/dtizen', authenticateDtizen, sendMessageV4);
router.post('/v5/dtizen', authenticateDtizen, sendMessageV5);
module.exports = router;
