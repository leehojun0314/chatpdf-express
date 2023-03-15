const express = require('express');
const getSql = require('../database/connection');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/', async (req, res) => {
	console.log('hello');
	const email = req.query.email;
	console.log('email : ', email);

	// try {
	// 	await connection.connect();
	// 	const request = new connection.Request();
	// 	const result = await request.query(
	// 		`SELECT * FROM UserTable WHERE user_email = '${email}'`,
	// 	);
	// 	connection.close();
	// 	res.send(result);
	// } catch (error) {
	// 	console.log(error);
	// 	res.send(error);
	// }

	getSql()
		.then((sqlPool) => {
			console.log('sql pool : ', sqlPool);
			sqlPool
				.request()
				.query(`SELECT * FROM UserTable WHERE user_email = '${email}'`)
				.then((result) => {
					console.log('result: ', result);
					res.send(result);
				})
				.catch((err) => {
					console.log('result: ', result);
					res.send(err);
				});
		})
		.catch((err) => {
			console.log('err : ', err);
			res.send(err);
		});
});

router.get('/:id', authenticate, (req, res) => {
	res.send(`User with ID: ${req.params.id}`);
});

module.exports = router;
