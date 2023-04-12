const express = require('express');
const googleAuth = require('./google');
const checkLogin = require('./check');
const router = express.Router();
router.get('/google', googleAuth);
router.get('/check', checkLogin);
router.get('/', (req, res) => {
	res.cookie('test', 'testcookie', {
		httpOnly: true,
		secure: true,
		maxAge: 1000 * 60 * 60 * 2, //2 hours
	});
	res.send('test cookie sent');
});
module.exports = router;
