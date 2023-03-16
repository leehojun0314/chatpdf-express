const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

const routes = require('./routes');
const userRoutes = require('./routes/users');
// CORS 설정
const allowedDomains = [
	'http://localhost:3000',
	'http://localhost:3001',
	'http://127.0.0.1:3000',
	'http://metaschool.dtizen.com',
	'https://dtizen.net',
	'http://onnl.net',
	'http://jw_lms.smartedu.center',
];

app.use(
	cors({
		origin: function (origin, callback) {
			console.log('origin: ', origin);
			if (allowedDomains.indexOf(origin) !== -1 || !origin) {
				console.log('cors true');
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
// app.use('/', indexRoutes);
app.use('/chatAi', routes.chatAi);
app.use('/getMessages', routes.getMessages);
app.use('/getConversations', routes.getConversations);
app.use('/users', userRoutes);
// '/users' 경로에 대한 라우터를 userRoutes로 설정
// app.use('/users', userRoutes);
// app.use('/chatAi', chatA);
// 서버 시작
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
