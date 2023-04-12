const express = require('express');
const googleAuth = require('./google');
const checkLogin = require('./check');
const router = express.Router();

router.get('/google', googleAuth);
router.get('/check', checkLogin);

module.exports = router;
