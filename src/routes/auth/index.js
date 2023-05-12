const express = require('express');
const googleAuth = require('./google');
const checkLogin = require('./check');
const kakaoAuth = require('./kakao');
const naverAuth = require('./naver');
const appleAuth = require('./apple');
const facebookAuth = require('./facebook');
const dtizenCheckLogin = require('./dtizenCheck');
const router = express.Router();

router.get('/google', googleAuth);
router.get('/kakao', kakaoAuth);
router.get('/naver', naverAuth);
router.get('/apple', appleAuth);
router.get('/facebook', facebookAuth);
router.get('/checkLogin', checkLogin);
router.get('/dtizenCheckLogin', dtizenCheckLogin);
// router.get('/check', checkLogin); ?????????????????? 왜 check/로 요청보내야 됨?? microsoft edge에서만?????
module.exports = router;
