const conversation = require('./conversation/index');
const message = require('./message/index');
const auth = require('./auth/index');
const test = require('./test');
const debate = require('./debate');
const routes = {
	conversation: conversation,
	message: message,
	debate: debate,
	auth: auth,
	test: test,
};
module.exports = routes;
