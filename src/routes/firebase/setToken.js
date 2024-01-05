const sql = require('mssql');
async function setToken(req, res) {
	console.log('body: ', req.body);
	const { loginToken, FCMToken } = req.body;
	try {
		if (!loginToken) {
			throw new Error('Invalid login token');
		}
		if (!FCMToken) {
			throw new Error('Invalid FCMToken');
		}

		(await getSql())
			.request()
			.query(
				`UPDATE membership SET a_fcm = '${FCMToken}' WHERE a_token = '${loginToken}'`,
			);
		res.status(200).send('token has been set successfully.');
	} catch (error) {
		console.log('firebase setToken error: ', error);
		res.status(500).send(error);
	}
}
async function getSql() {
	const sqlConnectionPool = new sql.ConnectionPool({
		server: process.env.DB_HOST,
		database: 'dtizen',
		password: process.env.DB_PWD,
		user: process.env.DB_USER,
		options: {
			encrypt: false,
		},
		pool: {
			max: 10,
			min: 0,
			idleTimeoutMillis: 30000,
		},
	});
	return await sqlConnectionPool.connect();
}
module.exports = setToken;
