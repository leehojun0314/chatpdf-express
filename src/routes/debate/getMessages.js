const selectDebate = require('../../model/selectDebate');
const selectDebateMessage = require('../../model/selectDebateMesages');

async function getMessages(req, res) {
	const answerId = req.query.answerId || '';
	const userId = req.user.user_id;
	if (!answerId) {
		res.status(400).send('please enter a valid answer id');
		return;
	}
	try {
		const debateResult = await selectDebate({
			answerId,
			userId,
		});
		console.log('select debate result: ', debateResult);
		const debateId = debateResult.recordset[0].debate_id;
		console.log('debate Id : ', debateId);
		const debateMessageRes = await selectDebateMessage({ debateId, userId });
		console.log('debateMessages: ', debateMessageRes);

		res.send({
			debate: debateResult.recordset[0],
			messages: debateMessageRes.recordset,
		});
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}

module.exports = getMessages;
