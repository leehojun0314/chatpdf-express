const { default: axios } = require('axios');
const { createJWT } = require('../../utils/functions');
const selectUser = require('../../model/selectUser');
require('dotenv').config('.env');

async function naverAuth(req, res) {
	const code = req.query.code;
	const state = req.query.state;
	const redirect_uri = req.query.redirect_uri;
	console.log('code: ', code);
	console.log('state: ', state);
	console.log('redirect_uri: ', redirect_uri);
	console.log('naver id: ', process.env.NAVER_ID);

	if (!code || !state || !redirect_uri) {
		res.status(400).send('bad request');
		return;
	}

	try {
		const code_response = await axios.post(
			'https://nid.naver.com/oauth2.0/token',
			{
				code: code,
				state: state,
				redirect_uri: redirect_uri,
				client_id: process.env.NAVER_ID,
				client_secret: process.env.NAVER_SECRET,
				grant_type: 'authorization_code',
			},
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			},
		);

		const { access_token } = code_response.data;
		console.log('access token: ', access_token);
		const { data } = await axios.get('https://openapi.naver.com/v1/nid/me', {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		});
		console.log('user data: ', data);
		//get data from database
		const userResult = await selectUser({
			email: data.response.email,
			name: data.response.name,
			profileImg: data.response.profile_image,
			authType: 'naver',
			authId: data.response.id,
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

module.exports = naverAuth;
