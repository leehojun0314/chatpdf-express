const configs = require('../../configs');

const authenticate = (req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	if (authorizationHeader) {
		res.status(401).json({ data: 'UnAuthorized' });
		return;
	}
	const token = authorizationHeader.split(' ')[1];
	console.log('req.headers: ', req.headers);
	req.user = {
		userEmail: '',
		userName: '',
		imgUrl: '',
		type: '',
		iat: 123,
		exp: 123,
		iss: '',
	};
	next();
};
// axios
// axios
// 	.get(`${configs.authenticateUrl}/api/verify?jwt=${token}`)
// 	.then((response) => {
// 		req.user = response.data;
// 		// user ex : {
// 		// 	userEmail: '',
// 		// 	userName: '',
// 		// 	imgUrl: '',
// 		// 	type: '',
// 		// 	iat: ,
// 		// 	exp: ,
// 		// 	iss: ''
// 		//   }
// 		next();
// 	})
// 	.catch((err) => {
// 		res.status(401).json({ data: 'UnAuthorized' });
// 	});
// };

module.exports = authenticate;
