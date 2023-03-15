const axios = require('axios');
const configs = require('../../configs');

const authenticate = (req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	const token = authorizationHeader?.split(' ')[1];

	if (!token) {
		res.status(401).json({ data: 'UnAuthorized' });
		return;
	} else {
		axios
			.get(`${configs.authenticateUrl}/api/verify?jwt=${token}`)
			.then((response) => {
				req.user = response.data;
				next();
			})
			.catch((err) => {
				res.status(401).json({ data: 'UnAuthorized' });
			});
	}
};

module.exports = authenticate;
