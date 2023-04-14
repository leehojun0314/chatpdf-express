const jwt = require('jsonwebtoken');
const selectUser = require('../../model/selectUser');
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
		console.log('decoded: ', decoded);
		const userResult = await selectUser({
			email: decoded.user_email,
			name: decoded.user_name,
		});
		console.log('select user result : ', userResult);
		if (userResult.recordset.length > 0) {
			res.json({
				isLoggedIn: true,
				userData: userResult.recordset[0],
				jwt: jwtToken,
			});
		} else {
			console.log('unknown user');
			res.json({ isLoggedIn: false });
		}
	} catch (error) {
		console.log('error : ', error);
		res.json({ isLoggedIn: false });
	}
}
module.exports = checkLogin;
