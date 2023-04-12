const conversation = require('./conversation/index');
const message = require('./message/index');
const auth = require('./auth/index');
const test = require('./test');
const routes = {
	conversation: conversation,
	message: message,
	auth: auth,
	test: test,
};
module.exports = routes;
