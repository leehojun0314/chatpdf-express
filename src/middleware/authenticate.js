const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
function authenticate(req, res, next) {
	const authorizationHeader = req.headers.authorization;
	const token = authorizationHeader?.split(' ')[1];
	if (!token) {
		res.status(401).json({ data: 'UnAuthorized' });
		return;
	}
	let decoded;
	try {
		decoded = jwt.verify(token, secretKey);
		console.log('user: ', decoded.user_name);
		req.user = decoded;
		next();
	} catch (error) {
		console.log('error : ', error);
	}
}
module.exports = authenticate;
