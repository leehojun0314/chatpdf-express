// export function initMessageGenerator(conversationId, message) {
// 	return {
// 		conversationId: conversationId,
// 		message: `다음 내용을 읽고 다음에 내가 물어볼때 대답해줘.
//     ${message}`,
// 		messageOrder: 0,
// 		sender: 'system',
// 	};
// }

// export function messageGenerator(recordset) {
// 	const messages = [];
// 	for (let record of recordset) {
// 		messages.push({
// 			role: record.sender,
// 			content: record.message,
// 		});
// 	}
// 	return messages;
// }
class MessageGenerator {
	messageSet(recordset) {
		const messages = [];
		for (let record of recordset) {
			messages.push({
				role: record.sender,
				content: record.message,
			});
		}
		return messages;
	}
	systemMessageDB(conversationId, message) {
		return {
			conversationId: conversationId,
			message: `다음 내용을 읽고 다음에 내가 물어볼때 대답해줘. 
        ${message}`,
			messageOrder: 0,
			sender: 'system',
		};
	}
	systemMessage(message) {
		return {
			role: 'system',
			content: message,
		};
	}
	userMessage(message) {
		return {
			role: 'user',
			content: message,
		};
	}
}
module.exports = new MessageGenerator();
