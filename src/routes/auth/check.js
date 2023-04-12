const jwt = require('jsonwebtoken');
const selectUser = require('../../model/selectUser');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
async function checkLogin(req, res) {
	const jwtToken = req.cookies?.get('jwt').value;
	console.log('cookies in header: ', req.headers.cookie);
	console.log('cookie in req: ', req.cookie);
	console.log('cookies in req: ', req.cookies);
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
			res.json({ isLoggedIn: true, userData: userResult.recordset[0] });
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
