const axios = require('axios');
const configs = require('../../configs');

const authenticateDtizen = (req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	const token = authorizationHeader?.split(' ')[1];
	console.log('req.headers: ', req.headers);
	if (!token) {
		res.status(401).json({ data: 'UnAuthorized' });
		return;
	} else {
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
	}
};

module.exports = authenticateDtizen;
