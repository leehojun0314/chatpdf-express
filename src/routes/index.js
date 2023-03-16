const chatAi = require('./chatAi');
const chatAi2 = require('./chatAi2');
const getMessages = require('./getMessages');
const getConversations = require('./getConversations');
const routes = {
	chatAi: chatAi,
	chatAi2: chatAi2,
	getMessages: getMessages,
	getConversations: getConversations,
};
module.exports = routes;
