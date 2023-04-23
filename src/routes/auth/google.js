const { default: axios } = require('axios');
const { OAuth2Client } = require('google-auth-library');
const { createJWT } = require('../../utils/functions');
const selectUser = require('../../model/selectUser');
require('dotenv').config('.env');

const client = new OAuth2Client(
	process.env.GOOGLE_ID,
	process.env.GOOGLE_SECRET,
);
async function googleAuth(req, res) {
	// const code = `4%2F0AVHEtk6z3-ZdiXu9dm6Y34uPvybOdOv5xQWJ2DBJgGQrfbewD2XVXa8hiiUfZmBWiGVDyg`;
	const code = req.query.code;
	const redirect_uri = req.query.redirect_uri;
	console.log('code: ', code);
	console.log('redirect _ uri : ', redirect_uri);
	console.log('google id: ', process.env.GOOGLE_ID);
	if (!code || !redirect_uri) {
		res.status(400).send('bad request');
		return;
	}
	try {
		const code_response = await axios.post(
			'https://oauth2.googleapis.com/token',
			{
				code: code,
				redirect_uri: redirect_uri,
				client_id: process.env.GOOGLE_ID,
				client_secret: process.env.GOOGLE_SECRET,
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
		const { data } = await axios.get(
			'https://www.googleapis.com/oauth2/v1/userinfo',
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			},
		);
		console.log('user data: ', data);
		//get data from database
		const userResult = await selectUser({
			email: data.email,
			name: data.name,
			profileImg: data.picture,
		});
		console.log('user recordset: ', userResult.recordset);
		const dbData = userResult.recordset[0];
		const jwt = createJWT(dbData);
		console.log('jwt: ', jwt);

		res.send({ jwt: jwt, userData: dbData });
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
}
module.exports = googleAuth;
