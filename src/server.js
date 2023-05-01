const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');
const routes = require('./routes');
const configs = require('../configs');
app.use(
	cors({
		origin: function (origin, callback) {
			if (configs.allowedOrigins.indexOf(origin) !== -1 || !origin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
	}),
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// 라우트 사용
// '/' 경로에 대한 라우터를 indexRoutes로 설정

app.get('/', (req, res) => {
	res.send('hello world');
});

app.use('/conversation', routes.conversation);
app.use('/message', routes.message);
app.use('/auth', routes.auth);
app.get('/.well-known/ai-plugin.json', (req, res) => {
	const jsonPath = path.join(__dirname, '..', '.well-known', 'ai-plugin.json');
	fs.readFile(jsonPath, 'utf-8', (err, data) => {
		if (err) {
			res.status(404).send('Not found');
		} else {
			res.setHeader('Content-Type', 'application/json');
			res.send(data);
		}
	});
});
app.get('/.well-known/openapi.yaml', (req, res) => {
	const jsonPath = path.join(__dirname, '..', '.well-known', 'openapi.yaml');
	fs.readFile(jsonPath, 'utf-8', (err, data) => {
		if (err) {
			res.status(404).send('Not found');
		} else {
			res.setHeader('Content-Type', 'application/json');
			res.send(data);
		}
	});
});
app.use('/test', routes.test);
// 서버 시작
// app.listen(port, () => {
// 	console.log(`Server is running at http://localhost:${port}`);
// });
function startServer() {
	const server = app.listen(port, () => {
		console.log(`Server is running at ${port} port`);
	});
	process.on('uncaughtException', (error) => {
		console.log('uncaught exception 발생 : ', error);
		// server.close(() => {
		// 	console.log('서버를 종료하고 재시작합니다.');
		// 	startServer();
		// });
		return false;
	});
	process.on('unhandledRejection', (reason, promise) => {
		console.log('unhandled rejection 발생 : ', reason);
		// server.close(() => {
		// 	console.log('서버를 종료하고 재시작합니다.');
		// 	startServer();
		// });
		return false;
	});
}
startServer();
