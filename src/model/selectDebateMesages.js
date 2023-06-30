const getSql = require('../database/connection');
function selectDebateMessage({ debateId, userId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Debate_Message WHERE debate_id = '${debateId}' AND user_id = ${userId} ORDER BY id ASC`,
					)
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});
			})
			.catch((err) => {
				reject(err);
			});
	});
}
module.exports = selectDebateMessage;
