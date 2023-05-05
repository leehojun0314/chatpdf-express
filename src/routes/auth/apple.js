const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');
const { createJWT } = require('../../utils/functions');
const selectUser = require('../../model/selectUser');
require('dotenv').config('.env');

async function appleAuth(req, res) {
	const client_id = process.env.APPLE_CLIENT_ID;
	const client_secret = process.env.APPLE_CLIENT_SECRET;
	const code = req.query.code;
	const redirect_uri = req.query.redirect_uri;
	console.log('code: ', code);
	console.log('redirect_uri: ', redirect_uri);
	console.log('apple client id: ', client_id);

	if (!code || !redirect_uri) {
		res.status(400).send('bad request');
		return;
	}

	try {
		const code_response = await axios.post(
			'https://appleid.apple.com/auth/token',
			{
				code: code,
				redirect_uri: redirect_uri,
				client_id: client_id,
				client_secret: client_secret,
				grant_type: 'authorization_code',
			},
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			},
		);

		const { id_token } = code_response.data;
		console.log('id token: ', id_token);

		// Decode and verify the ID token
		const decoded = jwt.decode(id_token, { complete: true });
		const { sub: appleId, email, name } = decoded.payload;
		console.log('user data: ', { appleId, email, name });

		//get data from database
		const userResult = await selectUser({
			appleId: appleId,
			email: email,
			name: name,
		});

		console.log('user recordset: ', userResult.recordset);
		const dbData = userResult.recordset[0];
		const appJWT = createJWT(dbData);
		console.log('jwt: ', appJWT);

		res.send({ jwt: appJWT, userData: dbData });
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
}

module.exports = appleAuth;
