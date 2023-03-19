const chatAi = require('./chatAi');
const chatAi2 = require('./chatAi2');
const chatAi3 = require('./chatAi3');
const getMessages = require('./getMessages');
const getConversations = require('./getConversations');
const routes = {
	chatAi: chatAi,
	chatAi2: chatAi2,
	chatAi3: chatAi3,
	getMessages: getMessages,
	getConversations: getConversations,
};
module.exports = routes;
