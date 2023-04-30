function selectConversation_single({ convIntId, userId }) {
	return new Promise((resolve, reject) => {
		getSql()
			.then((sqlPool) => {
				sqlPool
					.request()
					.query(
						`SELECT * FROM Conversation WHERE id = ${convIntId} AND (visibility = 'public' OR (visibility = 'private' AND user_id = ${userId}))`,
					)
					.then((result) => {
						resolve(result.recordset[0]);
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
module.exports = selectConversation_single;
