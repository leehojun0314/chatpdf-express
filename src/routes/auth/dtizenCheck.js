const jwt = require('jsonwebtoken');
const selectUser = require('../../model/selectUser');
const { default: axios } = require('axios');
const configs = require('../../../configs');
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
			res.send({ isLoggedIn: true });
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
