const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const configs = require('../../../configs');

const ACCOUNT_NAME = configs.blob.ACCOUNT_NAME;
const ACCOUNT_KEY = configs.blob.ACCOUNT_KEY;
const CONTAINER_NAME = configs.blob.CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(
	`DefaultEndpointsProtocol=https;AccountName=${ACCOUNT_NAME};AccountKey=${ACCOUNT_KEY};EndpointSuffix=core.windows.net`,
);

const uploadBlob = async (file) => {
	const fileName = file.newFilename;
	const blobName = `${Date.now()}-${fileName}`;
	const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
	const blockBlobClient = containerClient.getBlockBlobClient(blobName);
	const fileStream = fs.createReadStream(file.filepath);
	await blockBlobClient.uploadStream(fileStream, undefined, undefined, {
		blobHTTPHeaders: { blobContentType: file.mimetype },
	});

	return {
		fileUrl: `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`,
		extension: file.mimetype,
		buffer: await fs.promises.readFile(file.filepath),
		originalFilename: file.originalFilename,
		fileSize: file.size,
	};
};

module.exports = async function uploadBlob_v2(files) {
	const promises = Object.values(files).map(uploadBlob);
	try {
		return await Promise.all(promises);
	} catch (error) {
		console.error('Error:', error);
		throw error;
	}
};
