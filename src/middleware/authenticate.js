const jwt = require('jsonwebtoken');
const selectUser = require('../model/selectUser');
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
		const user = decoded;
		selectUser({
			email: user.user_email,
			name: user.user_name,
			authType: user.auth_type,
			authId: user.auth_id,
		})
			.then((selectResult) => {
				console.log('authenticate selectResult: ', selectResult);
				if (selectResult.recordset.length) {
					req.user = selectResult.recordset[0];
					next();
				} else {
					res.status(401).send('unknown user');
				}
			})
			.catch((err) => {
				console.log('select user err: ', err);
				res.status(500).send(err);
			});
	} catch (error) {
		console.log('error : ', error);
		res.status(401).send('unauthorized');
	}
}
module.exports = authenticate;
