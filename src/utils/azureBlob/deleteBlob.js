// async function deleteBlob(blobName, folderPath, containerId, sasToken) {
// 	sasToken = await getSasKey(containerId);
// 	const containerClient = getContainerClient(sasToken, containerId);
// 	let dir = folderPath.length > 0 ? folderPath.join('/') + '/' : '';
// 	console.log(dir + blobName);
// 	await containerClient.deleteBlob(dir + path.basename(blobName));
// }
const { BlobServiceClient } = require('@azure/storage-blob');
const configs = require('../../../configs');
const path = require('path');
const ACCOUNT_NAME = configs.blob.ACCOUNT_NAME;
const ACCOUNT_KEY = configs.blob.ACCOUNT_KEY;
const CONTAINER_NAME = configs.blob.CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(
	`DefaultEndpointsProtocol=https;AccountName=${ACCOUNT_NAME};AccountKey=${ACCOUNT_KEY};EndpointSuffix=core.windows.net`,
);

module.exports = async function deleteBlob(fileUrl) {
	try {
		const containerClient =
			blobServiceClient.getContainerClient(CONTAINER_NAME);
		const fileName = path.basename(fileUrl);
		console.log('fileName : ', fileName);
		const blockBlobClient = containerClient.getBlockBlobClient(fileName);
		await blockBlobClient.delete();
	} catch (error) {
		console.log('delete error: ', error);
		throw error;
	}
};
