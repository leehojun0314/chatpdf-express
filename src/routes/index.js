// const chatAi = require('./message/chatAi');
// const chatAi2 = require('./chatAi2');
// const chatAi3 = require('./chatAi3');
// const getMessages = require('./getMessages');
// const getConversations = require('./getConversations');
// const createConversation = require('./conversation/createConversation');
const conversation = require('./conversation/index');
const message = require('./message/index');
const auth = require('./auth');
const test = require('./test');
const routes = {
	// chatAi: chatAi,
	// chatAi2: chatAi2,
	// chatAi3: chatAi3,
	// getMessages: getMessages,
	// getConversations: getConversations,
	// createConversation: createConversation,
	conversation: conversation,
	message: message,
	auth: auth,
	test: test,
};
module.exports = routes;
