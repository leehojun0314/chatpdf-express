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

module.exports = async function uploadBlob_v2(files) {
	//todo check extension
	const promises = [];
	for (let fileKey in files) {
		console.log('file key: ', fileKey);
		const file = files[fileKey];
		const fileName = file.newFilename;
		const blobName = `test/${Date.now()}-${fileName}`;
		const containerClient =
			blobServiceClient.getContainerClient(CONTAINER_NAME);
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);
		const fileStream = file ? fs.createReadStream(file.filepath) : null;

		promises.push(
			new Promise((bufferResolve, bufferReject) => {
				fs.readFile(file.filepath, async (err, bufferData) => {
					if (err) {
						console.log('buffer err: ', err);
						bufferReject(err);
						return;
					}

					try {
						await blockBlobClient.uploadStream(
							fileStream,
							undefined,
							undefined,
							{
								blobHTTPHeaders: {
									blobContentType: file.mimetype,
								},
							},
						);

						const fileUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`;
						bufferResolve({
							fileUrl,
							extension: file.mimetype,
							buffer: bufferData,
							originalFilename: file.originalFilename,
							fileSize: file.size,
						});
					} catch (error) {
						console.error(error);
						bufferReject({ err: error });
					}
				});
			}),
		);
	}

	try {
		const results = await Promise.all(promises);
		return results;
	} catch (error) {
		console.log('error: ', error);
		return;
	}
};
