const jwt = require('jsonwebtoken');
const selectUser = require('../../model/selectUser');
const { default: axios } = require('axios');
const configs = require('../../../configs');
const { createJWT } = require('../../utils/functions');
// const updateLastConv = require('../../model/updateLastConv');
// const selectConversation_all = require('../../model/selectConversation_all');
require('dotenv').config();
async function dtizenCheckLogin(req, res) {
	const authorizationHeader = req.headers.authorization;
	const jwtToken = authorizationHeader?.split(' ')[1];
	if (!jwtToken) {
		return res.status(401).json({ isLoggedIn: false });
	}
	axios
		.get(`${configs.authenticateUrl}/api/verify?jwt=${jwtToken}`)
		.then((response) => {
			const data = response.data;
			console.log('data from dtizen secure: ', data);
			return selectUser({
				email: data.user_email,
				name: data.user_name,
				profileImg: data.imgUrl,
				authType: data.authType,
				authId: 'dtizenlogin',
			});
		})
		.then((selectUserRes) => {
			const userData = selectUserRes.recordset[0];
			console.log('userData: ', userData);
			const newJwt = createJWT(userData);
			res.send({ isLoggedIn: true, jwt: newJwt, userData });
		})
		.catch((err) => {
			console.log('dtizen login check error: ', err);
			res.status(500).send({
				isLoggedIn: false,
				error: err,
			});
		});
}
module.exports = dtizenCheckLogin;
