const axios = require('axios');
const configs = require('../../configs');
const selectUser = require('../model/selectUser');

const authenticateDtizen = (req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	const token = authorizationHeader?.split(' ')[1];
	if (!token) {
		res.status(401).json({ data: 'UnAuthorized' });
		return;
	} else {
		axios
			.get(`${configs.authenticateUrl}/api/verify?jwt=${token}`)
			.then((response) => {
				return selectUser({
					email: response.data.user_email,
					name: response.data.user_name,
					profileImg: response.data.imgUrl,
				});
				// user ex : {
				// 	userEmail: '',
				// 	userName: '',
				// 	imgUrl: '',
				// 	type: '',
				// 	iat: ,
				// 	exp: ,
				// 	iss: ''
				//   }
			})
			.then((selectUserRes) => {
				const userData = selectUserRes.recordset[0];
				req.user = userData;
				next();
			})
			.catch((err) => {
				res.status(401).json({ data: 'UnAuthorized' });
			});
	}
};

module.exports = authenticateDtizen;
