const axios = require('axios');
const configs = require('../../configs');

const authenticate = (req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	if (authorizationHeader) {
		res.status(401).json({ data: 'UnAuthorized' });
		return;
	}
	const token = authorizationHeader.split(' ')[1];
	console.log('req.headers: ', req.headers);
	axios
		.get(`${configs.authenticateUrl}/api/verify?jwt=${token}`)
		.then((response) => {
			req.user = response.data;
			// user ex : {
			// 	userEmail: '',
			// 	userName: '',
			// 	imgUrl: '',
			// 	type: '',
			// 	iat: ,
			// 	exp: ,
			// 	iss: ''
			//   }
			next();
		})
		.catch((err) => {
			res.status(401).json({ data: 'UnAuthorized' });
		});
};

module.exports = authenticate;
