const express = require('express');
const googleAuth = require('./google');
const checkLogin = require('./check');
const router = express.Router();

router.get('/google', googleAuth);
router.get('/checkLogin', checkLogin);
// router.get('/check', checkLogin); ?????????????????? 왜 check/로 요청보내야 됨?? microsoft edge에서만?????
module.exports = router;
