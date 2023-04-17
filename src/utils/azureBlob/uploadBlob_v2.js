const { BlobServiceClient } = require('@azure/storage-blob');
const formidable = require('formidable');
const fs = require('fs');
const configs = require('../../../configs');

const ACCOUNT_NAME = configs.blob.ACCOUNT_NAME;
const ACCOUNT_KEY = configs.blob.ACCOUNT_KEY;
const CONTAINER_NAME = configs.blob.CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(
	`DefaultEndpointsProtocol=https;AccountName=${ACCOUNT_NAME};AccountKey=${ACCOUNT_KEY};EndpointSuffix=core.windows.net`,
);

module.exports = function uploadBlob_v2(file) {
	return new Promise((resolve, reject) => {
		const fileName = file.newFilename;
		const blobName = `${Date.now()}-${fileName}`;
		const containerClient =
			blobServiceClient.getContainerClient(CONTAINER_NAME);
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);
		const fileStream = file ? fs.createReadStream(file.filepath) : null; //파일 스트림 생성
		blockBlobClient
			.uploadStream(fileStream, undefined, undefined, {
				blobHTTPHeaders: {
					blobContentType: file.mimetype,
				},
			})
			.then((response) => {
				const fileUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`;
				resolve({ fileUrl, extension: file.mimetype });
			})
			.catch((err) => {
				reject({ err: err });
			});
	});
};
