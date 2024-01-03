const express = require('express');
const setToken = require('./setToken');
const router = express.Router();
router.post('/setToken', setToken);
module.exports = router;
