const express = require('express');
const insertMessage = require('../../model/insertMessage');
const selectMessage = require('../../model/selectMessage');
const selectUser = require('../../model/selectUser');
const sendToAi_vola_stream = require('../../utils/openai/sendToAi__vola_stream');
const {
	getRelatedParagraphs,
} = require('../../utils/optimizer/getRelatedParagraphs');
const selectParagraph_all = require('../../model/selectParagraph_all');
const selectConvIntId = require('../../model/selectConvIntId');
const {
	getRelatedParagraphs_v2,
} = require('../../utils/optimizer/getRelatedParagraphs_v2');
async function sendMessageV4(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
	const convStringId = req.body?.conversationId || '';
	const user = req.user;
	const message = req.body?.text;
	if (!convStringId) {
		res.status(404).send('please enter a valid conversation id');
		return;
	}
	try {
		const convIntId = await selectConvIntId({ convStringId: convStringId });
		console.log('user: ', user);
		const userResult = await selectUser({
			email: user.user_email,
			name: user.use_name,
			profileImg: user.imgUrl || user.picture || '',
		});
		console.log('user result: ', userResult);
		const userId = userResult.recordset[0].user_id;
		const selectParagraphsResult = await selectParagraph_all({
			convIntId,
		});
		console.log(
			'paragraph recordset length : ',
			selectParagraphsResult.recordset.length,
		);
		const relatedParagraphs = await getRelatedParagraphs_v2(
			selectParagraphsResult.recordset,
			message,
		);
		// const systemMessage = generator.systemMessage()
		const messagesResult = await selectMessage({
			convIntId,
			userId: userId,
		});
		const relatedParagraph = relatedParagraphs
			.map((p) => `(Page : ${p.order_number + 1}) ${p.paragraph_content}`)
			.join('\n');
		await sendToAi_vola_stream(
			relatedParagraph, //지문의 내용
			message,
			async ({ text, isEnd, error }) => {
				if (error) {
					console.log('openai error : ', error);
					res.status(500).send(error);
					return;
				}
				if (isEnd) {
					//내가 보낸 내용 insert
					await insertMessage({
						message: message,
						sender: 'user',
						messageOrder: messagesResult.recordset.length,
						convIntId: convIntId,
						userId: userId,
					});
					//ai가 보낸 내용 insert
					await insertMessage({
						message:
							text +
							(relatedParagraphs.length > 0
								? `\n(ref : ${relatedParagraphs
										.map((p) => p.order_number + 1)
										.join(', ')} page) `
								: ''),
						sender: 'assistant',
						messageOrder: messagesResult.recordset.length + 1,
						convIntId: convIntId,
						userId: userId,
					});
					res.end('');
				} else {
					// res.write(text);
					res.write(
						JSON.stringify({
							text,
							pages: relatedParagraphs.map((p) => p.order_number + 1),
						}) + '\n',
					);
				}
			},
		);

		// const messagesFinalResult = await selectMessage({ conversationId });
	} catch (error) {
		console.log('err: ', error);
		res.status(400).send(error);
	}
}

module.exports = sendMessageV4;
