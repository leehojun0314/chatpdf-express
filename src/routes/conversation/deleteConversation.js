const deleteConversationModel = require('../../model/deleteConversationModel');
const selectConvIntId = require('../../model/selectConvIntId');
const selectDocuments = require('../../model/selectDocuments');
const deleteBlob = require('../../utils/azureBlob/deleteBlob');
const deleteParagraphPinecone = require('../../utils/pinecone/deleteParagraph');

async function deleteConversation(req, res) {
	const convStringId = req.query.convId;
	const userId = req.user.user_id;

	console.log('delete conv id : ', convStringId);
	if (!convStringId) {
		res.status(404).send('conversation id is not given');
		return;
	}
	try {
		const convIntId = await selectConvIntId({ convStringId });
		//select all documents and get file Urls
		const documents = await selectDocuments({ convIntId });
		console.log('documents: ', documents);
		for (docu of documents) {
			const fileUrl = docu.document_url;
			//delete from azure storage
			await deleteBlob(fileUrl);
		}
		//delete from vector store
		const pineconeRes = await deleteParagraphPinecone({ convIntId });
		console.log('pinecone delete res: ', pineconeRes);
		//delete from database
		await deleteConversationModel({ convIntId, userId });
		res.status(200).send('conversation deleted');
	} catch (error) {
		console.log('delete error : ', error);
		res.status(500).send(error.message);
	}
}
module.exports = deleteConversation;
