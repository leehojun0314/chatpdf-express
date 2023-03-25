async function deleteConversation(req, res) {
	const query = req.query.convId;
	if (!query) {
		res.status(404).send('conversation id is not given');
		return;
	}
	try {
		await deleteConversation;
		res.status(200).send('conversation deleted');
	} catch (error) {
		res.status(500).send(error);
	}
}
module.exports = deleteConversation;
