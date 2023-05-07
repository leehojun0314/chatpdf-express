const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');
const { createJWT } = require('../../utils/functions');
const selectUser = require('../../model/selectUser');
require('dotenv').config('.env');
const signWithApplePrivateKey = process.env.APPLE_PRIVATE_KEY;
const getSignWithAppleSecret = () => {
	const token = jwt.sign({}, signWithApplePrivateKey, {
		algorithm: 'ES256',
		expiresIn: '10h',
		audience: 'https://appleid.apple.com',
		issuer: process.env.APPLE_TEAM_ID, // TEAM_ID
		subject: process.env.APPLE_CLIENT_ID,
		keyid: process.env.APPLE_KEY_ID, // KEY_ID
	});
	return token;
};
async function appleAuth(req, res) {
	const client_id = process.env.APPLE_CLIENT_ID;
	// const client_secret = process.env.APPLE_CLIENT_SECRET;
	const code = req.query.code;
	const redirect_uri = req.query.redirect_uri;
	console.log('code: ', code);
	// console.log('redirect_uri: ', redirect_uri);
	console.log('apple client id: ', client_id);
	const secret = getSignWithAppleSecret();
	console.log('secret: ', secret);
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
				client_secret: secret,
				grant_type: 'authorization_code',
				client_id: client_id,
				redirect_uri: redirect_uri,
			},
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			},
		);
		console.log('code response: ', code_response);
		const { id_token } = code_response.data;
		console.log('id token: ', id_token);

		// Decode and verify the ID token
		const decoded = jwt.decode(id_token, { complete: true });
		const { sub: appleId, email, name } = decoded.payload;
		console.log('user data: ', { appleId, email, name });
		res.send('good');
		//get data from database
		// const userResult = await selectUser({
		// 	appleId: appleId,
		// 	email: email,
		// 	name: name,
		// });

		// console.log('user recordset: ', userResult.recordset);
		// const dbData = userResult.recordset[0];
		// const appJWT = createJWT(dbData);
		// console.log('jwt: ', appJWT);

		// res.send({ jwt: appJWT, userData: dbData, ok: true });
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
}

module.exports = appleAuth;
