const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const sendSolapiMessage = require('./sendSolapiMessage');
router.post('/sendMessages', sendSolapiMessage);

module.exports = router;
