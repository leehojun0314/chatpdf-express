const jwt = require('jsonwebtoken');
const selectUser = require('../../model/selectUser');
// const updateLastConv = require('../../model/updateLastConv');
// const selectConversation_all = require('../../model/selectConversation_all');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
async function checkLogin(req, res) {
	const authorizationHeader = req.headers.authorization;
	const jwtToken = authorizationHeader?.split(' ')[1];
	if (!jwtToken) {
		return res.status(401).json({ isLoggedIn: false });
	}
	if (!secretKey) {
		console.log('secret key not set');
		return res.status(500).send('secret key not set');
	}
	let decoded;
	try {
		decoded = jwt.verify(jwtToken, secretKey);
		console.log('user : ', decoded);
		const userResult = await selectUser({
			email: decoded.user_email,
			name: decoded.user_name,
			authId: decoded.authId,
			authType: decoded.authType,
		});
		const lastConv = userResult.recordset[0].last_conv;

		if (userResult.recordset.length > 0) {
			// if (!lastConv) {
			// 	const conversationsResult = await selectConversation_all({
			// 		userId: userResult.recordset[0].user_id,
			// 	});
			// 	if (!conversationsResult.recordset.length) {
			// 		res.send({
			// 			isLoggedIn: true,
			// 			userData: userResult.recordset[0],
			// 		});
			// 		return;
			// 	}
			// 	const lastConversation =
			// 		conversationsResult.recordset[
			// 			conversationsResult.recordset.length - 1
			// 		];
			// 	await updateLastConv({
			// 		userId: userResult.recordset[0].user_id,
			// 		convId: lastConversation.conversation_id,
			// 	});
			// 	res.send({
			// 		isLoggedIn: true,
			// 		userData: {
			// 			...userResult.recordset[0],
			// 			last_conv: lastConversation.conversation_id,
			// 		},
			// 		jwt: jwtToken,
			// 	});
			// } else {
			res.send({
				isLoggedIn: true,
				userData: userResult.recordset[0],
				jwt: jwtToken,
			});
			// }
		} else {
			console.log('unknown user');
			res.send({ isLoggedIn: false });
		}
	} catch (error) {
		console.log('error : ', error);
		res.send({ isLoggedIn: false });
	}
}
module.exports = checkLogin;
