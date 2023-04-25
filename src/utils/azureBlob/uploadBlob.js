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

module.exports = function uploadBlob(req) {
	const form = formidable();

	return new Promise((resolve, reject) => {
		form.parse(req, async (err, fields, files) => {
			if (err) {
				console.error(err);
				reject({ err });
				return;
			}

			const file = files['file'];
			const fileName = file.newFilename;
			const blobName = `${Date.now()}-${fileName}`;
			const containerClient =
				blobServiceClient.getContainerClient(CONTAINER_NAME);
			const blockBlobClient = containerClient.getBlockBlobClient(blobName);
			const fileStream = file ? fs.createReadStream(file.filepath) : null; //파일 스트림 생성
			const buffer = await new Promise((bufferResolve, bufferReject) => {
				fs.readFile(file.filepath, (err, bufferData) => {
					if (err) {
						console.log('buffer err: ', err);
						bufferReject(err);
						return;
					}
					bufferResolve(bufferData);
				});
			});
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
				resolve({ fileUrl, fields, extension: file.mimetype, buffer });
			} catch (error) {
				console.error(error);
				reject({ err: error });
			}
		});
	});
};
