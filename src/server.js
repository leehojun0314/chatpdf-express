const express = require('express');
const cors = require('cors');

const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');

const app = express();
const port = process.env.PORT || 3000;

// CORS 설정
const allowedDomains = [
	'http://localhost:3000',
	'http://localhost:3001',
	'http://127.0.0.1:3000',
	'http://metaschool.dtizen.com',
	'https://dtizen.net',
	'http://onnl.net',
];

app.use(
	cors({
		origin: function (origin, callback) {
			if (allowedDomains.indexOf(origin) !== -1 || !origin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
	}),
);

// 라우트 사용
app.use('/', indexRoutes);
app.use('/users', userRoutes);

// 서버 시작
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
