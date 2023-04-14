require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
function authenticate(req, res, next) {
	const authorizationHeader = req.headers.authorization;
	const token = authorizationHeader?.split(' ')[1];
	console.log('req.headers: ', req.headers);
	if (!token) {
		res.status(401).json({ data: 'UnAuthorized' });
		return;
	}
	let decoded;
	try {
		decoded = jwt.verify(jwtToken, secretKey);
		console.log('decoded: ', decoded);
		req.user = decoded;
		next();
	} catch (error) {
		console.log('error : ', error);
	}
}
module.exports = authenticate;
