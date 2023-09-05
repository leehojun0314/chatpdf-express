const express = require('express');
const router = express.Router();
const authenticateSolapi = require('../../middleware/authenticateSolapi');
const sendSolapiMessage = require('./sendSolapiMessage');
router.post('/sendMessages', authenticateSolapi, sendSolapiMessage);

module.exports = router;
