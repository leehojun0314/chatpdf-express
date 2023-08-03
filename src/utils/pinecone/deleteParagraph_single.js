const { PineconeClient } = require('@pinecone-database/pinecone');
require('dotenv').config();
const pineconeClient = new PineconeClient();
async function deleteParagraph_single({ convIntId, docuId }) {
	try {
		await pineconeClient.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});
		const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);
		const deleteRes = await pineconeIndex._delete({
			deleteRequest: {
				filter: {
					docuId: { $eq: Number(docuId) },
				},
			},
		});
		return deleteRes;
	} catch (err) {
		throw err;
	}
}
module.exports = deleteParagraph_single;
