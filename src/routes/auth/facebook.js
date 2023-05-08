const { default: axios } = require('axios');
const selectUser = require('../../model/selectUser');
const { createJWT } = require('../../utils/functions');

async function facebookAuth(req, res) {
	const code = req.query.code;
	const redirect_uri = req.query.redirect_uri;
	console.log('code: ', code);
	console.log('redirect_uri: ', redirect_uri);
	console.log('facebook id: ', process.env.FACEBOOK_CLIENT_ID);

	if (!code || !redirect_uri) {
		res.status(400).send('bad request');
		return;
	}

	try {
		const code_response = await axios.get(
			`https://graph.facebook.com/v16.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${redirect_uri}&client_secret=${process.env.FACEBOOK_SECRET}&code=${code}`,
		);

		const { access_token } = code_response.data;
		console.log('access token: ', access_token);

		const { data } = await axios.get(
			`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${access_token}`,
		);

		console.log('user data: ', data);
		// data samle
		// user data:  {
		//     id: '2888651824603334',
		//     name: '이호준',
		//     picture: {
		//       data: {
		//         height: 200,
		//         is_silhouette: false,
		//         url: 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=2888651824603334&height=200&width=200&ext=1686146326&hash=AeT-LdoUI-L0ZRwi_Iw',
		//         width: 200
		//       }
		//     }
		//   }
		const authId = data.id;
		const name = data.name;
		const email = data.email;
		const picture = data.picture.data.url;

		const userResult = await selectUser({
			email,
			name,
			profileImg: picture,
			authId,
			authType: 'facebook',
		});
		const dbData = userResult.recordset[0];
		const jwt = createJWT(dbData);
		res.send({
			jwt,
			userData: dbData,
		});
	} catch (err) {
		console.log('err: ', err);
		res.status(500).send(err);
	}
}
module.exports = facebookAuth;
