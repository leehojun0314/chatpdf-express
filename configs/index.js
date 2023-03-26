require('dotenv').config();
const configs = {
	openai: {
		apiKey: process.env.OPENAI_API_KEY,
		organization: 'org-FF6yTVLsIHFQDUD82Y7LoiQZ',
	},
	db: {
		user: process.env.DB_USER,
		password: process.env.DB_PWD,
		database: process.env.DB_NAME,
		server: process.env.DB_HOST,
		// pool: {
		// 	max: 10,
		// 	min: 0,
		// 	idleTimeoutMillis: 30000,
		// },
		options: {
			encrypt: false, //need to be false for no error occur
			// trustServerCertificate: false,
		},
	},
	s3: {
		S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
		AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
		AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
	},
	allowedOrigins: [
		'http://localhost:3000',
		'http://localhost:3001',
		'http://127.0.0.1:3000',
		'http://metaschool.dtizen.com',
		'https://dtizen.net',
		'http://dtizen.net',
		'http://onnl.net',
	],
	authenticateUrl: 'https://dtizen-secure.vercel.app',
};
module.exports = configs;
