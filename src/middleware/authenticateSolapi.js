function authenticateSolapi(req, res, next) {
	const secretkey = req.headers.secretkey;
	console.log('secretKey : ', secretkey);
	console.log('req. headers: ', req.headers);
	console.log('key from env: ', process.env.solapiKey);
	if (secretkey === process.env.solapiKey) {
		next();
	} else {
		res.status(404).send('Authentication failed');
	}
}
module.exports = authenticateSolapi;
