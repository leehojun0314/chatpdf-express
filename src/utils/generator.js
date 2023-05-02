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
			message: `당신은 다음 내용을 이해하고, 해당 내용에 대해서 질문을 받을 시 친절하게 답변해주는 챗봇입니다. 먼저 어떤 내용을 알고 있는지 간단하게 소개하고, 인사해주세요! 언어는 지문의 언어를 따라가주세요.
			${message}`,
			messageOrder: 0,
			sender: 'system',
		};
	}
	presetSalutation(message) {
		return {
			role: 'user',
			// content: `You are a chatbot that reads the following text and kindly responds when user ask about the text.
			// When answering, respond according to the language the user is using.
			// First, briefly introduce what you know to the user, and say hi!
			// Please make the language used when greeting the same as the language of the following text.
			// text : ${message}`,
			//다음 지문을 읽고, 챗봇으로써 어떤 내용을 알고있는지 간단하게 소개하고 사용자에게 인사해줘. 인사할 때 언어는 지문의 언어와 동일하게 해줘.
			content: `
			Read the text below, as a chat bot, tell the user what do you know about it shortly and say hello to them! The language you use should follow the text used. ex) if the text is english, you use english. if the text is korean, you use koean.
			text : ${message}`,
		};
	}
	systemMessage(message) {
		return {
			role: 'system',
			content: `당신은 챗봇으로써 다음 내용을 읽고 유저의 질문에 대답해주세요. 내용은 전체 내용에서 질문과 연관된 부분울 추출한 것입니다. 답변에 사용하는 언어는 사용자가 사용하는 언어와 동일하게 해주세요.
			content : ${message}`,
		};
	}
	userMessage(message) {
		return {
			role: 'user',
			content: message,
		};
	}
	presetQuestion(content) {
		return {
			role: 'user',
			content: `아래 지문을 읽고 예상되는 질문(해당 지문에 답이 있는)을 5개만 작성해줘. 그리고 문장 끝이 항상 "?"로 끝나게 해줘. 언어는 지문의 언어를 따라가줘. 질문의 앞에 번호를 매겨줘. 질문마다 '\n'을 사이에 넣어서 분리해줘.
			지문: ${content}
			 `,
		};
	}
	createSummary(content) {
		return {
			role: 'user',
			content: `다음 지문을 읽고 주요 내용을 300자 내로 요약해줘. 전체적인 내용과 관련 없는 내용은 생략해도 돼. 
			지문 : ${content}`,
		};
	}
}
module.exports = new MessageGenerator();
