async function deleteConversation(req, res) {
	const convId = req.query.convId;
	if (!convId) {
		res.status(404).send('conversation id is not given');
		return;
	}
	try {
		await deleteConversation({ convId });
		res.status(200).send('conversation deleted');
	} catch (error) {
		res.status(500).send(error);
	}
}
module.exports = deleteConversation;
