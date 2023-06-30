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
	blob: {
		ACCOUNT_NAME: process.env.ACCOUNT_NAME,
		ACCOUNT_KEY: process.env.ACCOUNT_KEY,
		CONTAINER_NAME: process.env.CONTAINER_NAME,
	},
	allowedOrigins: [
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:3002',
		'http://127.0.0.1:3000',
		'http://metaschool.dtizen.com',
		'https://dtizen.net',
		'http://dtizen.net',
		'http://onnl.net',
		'http://jw_lms.smartedu.center',
		'https://www.talkdocu.com',
		'https://talkdocu.vercel.app',
		'https://jemishome-web-cdn.azureedge.net',
		'https://appleid.apple.com',
		'http://20.200.224.181:80',
		'http://www.smartedu.center',
	],
	authenticateUrl: 'https://dtizen-secure.vercel.app',
	relatedParagraphLength: 3000,
	createSalutationPLength: 3000,
	salutationPrefixMessage: 'Hello! How can I help you?',
	vectorResultSimilarityScore: 0.75,
	promptTokenLimit: 3000,
};
module.exports = configs;
