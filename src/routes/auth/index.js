const express = require('express');
const googleAuth = require('./google');
const checkLogin = require('./check');
const router = express.Router();
router.get('/', (req, res) => {
	console.log('test cookie');
	res.cookie('test', 'testcookie', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		maxAge: 1000 * 60 * 60 * 2, //2 hours
	});
	res.send('test cookie sent');
});
router.get('/google', googleAuth);
router.get('/check', checkLogin);

module.exports = router;
