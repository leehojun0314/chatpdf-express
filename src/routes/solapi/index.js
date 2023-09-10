const express = require('express');
const router = express.Router();
const authenticateSolapi = require('../../middleware/authenticateSolapi');
const sendSolapiMessage = require('./sendSolapiMessage');
const SendSolapiKakao = require('./sendSolapiKakao');
router.post('/sendMessage', sendSolapiMessage);
router.post('/sendKakao', SendSolapiKakao);

module.exports = router;
