const express = require('express');
const setToken = require('./setToken');
const sendNoti = require('./sendNoti');
const router = express.Router();
router.post('/setToken', setToken);
router.post('/sendNoti', sendNoti);
module.exports = router;
