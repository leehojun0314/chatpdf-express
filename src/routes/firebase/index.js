const express = require('express');
const setToken = require('./setToken');
const sendNoti = require('./sendNoti');
const router = express.Router();
router.post('/setToken', setToken);
router.get('/sendNoti', sendNoti);
module.exports = router;
