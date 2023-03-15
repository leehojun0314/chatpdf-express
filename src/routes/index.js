const chatAi = require('./chatAi');
const getMessages = require('./getMessages');
const getConversations = require('./getConversations');
const routes = {
	chatAi: chatAi,
	getMessages: getMessages,
	getConversations: getConversations,
};
module.exports = routes;
