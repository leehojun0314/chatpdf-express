const { default: axios } = require('axios');
const { createJWT } = require('../../utils/functions');
const selectUser = require('../../model/selectUser');
require('dotenv').config('.env');

async function kakaoAuth(req, res) {
	const code = req.query.code;
	const redirect_uri = req.query.redirect_uri;

	if (!code || !redirect_uri) {
		res.status(400).send('bad request');
		return;
	}

	try {
		const code_response = await axios.post(
			'https://kauth.kakao.com/oauth/token',
			{
				code: code,
				redirect_uri: redirect_uri,
				client_id: process.env.KAKAO_ID,
				grant_type: 'authorization_code',
			},
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			},
		);
		const { access_token } = code_response.data;
		const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		});
		//get data from database
		const userResult = await selectUser({
			email: data.kakao_account.email,
			name: data.properties.nickname,
			profileImg: data.properties.profile_image,
		});
		console.log('user recordset: ', userResult.recordset);
		const dbData = userResult.recordset[0];
		const jwt = createJWT(dbData);
		res.send({ jwt: jwt, userData: dbData });
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
}

module.exports = kakaoAuth;
