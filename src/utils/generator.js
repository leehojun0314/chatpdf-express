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
	systemMessage(message) {
		return {
			role: 'system',
			content: `당신은 다음 내용을 이해하고, 해당 내용에 대해서 질문을 받을 시 친절하게 답변해주는 챗봇입니다. 먼저 어떤 내용을 알고 있는지 간단하게 소개하고, 인사해주세요! 언어는 지문의 언어를 따라가주세요.
			${message}`,
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
			content: `아래 지문을 읽고 예상되는 질문을 작성해줘. 그리고 문장 끝이 항상 "?"로 끝나게 해줘. 언어는 지문의 언어를 따라가줘.
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
