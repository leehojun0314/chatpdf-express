const { PineconeClient } = require('@pinecone-database/pinecone');
require('dotenv').config();
const pineconeClient = new PineconeClient();
async function deleteParagraphPinecone({ convIntId }) {
	try {
		await pineconeClient.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);
		const deleteRes = await pineconeIndex._delete({
			deleteRequest: {
				filter: {
					convIntId: { $eq: Number(convIntId) },
				},
			},
		});
		return deleteRes;
	} catch (err) {
		throw err;
	}
}
module.exports = deleteParagraphPinecone;
