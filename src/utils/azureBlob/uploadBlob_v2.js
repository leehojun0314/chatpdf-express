const { BlobServiceClient } = require('@azure/storage-blob');
const formidable = require('formidable');
const fs = require('fs');
const configs = require('../../../configs');
const PdfParse = require('pdf-parse');

const ACCOUNT_NAME = configs.blob.ACCOUNT_NAME;
const ACCOUNT_KEY = configs.blob.ACCOUNT_KEY;
const CONTAINER_NAME = configs.blob.CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(
	`DefaultEndpointsProtocol=https;AccountName=${ACCOUNT_NAME};AccountKey=${ACCOUNT_KEY};EndpointSuffix=core.windows.net`,
);
function pageRender(pageArr) {
	return (pageData) => {
		let renderOptions = {
			normalizeWhitespace: true,
		};

		return pageData.getTextContent(renderOptions).then((textContent) => {
			const mappedText = textContent.items.map((item) => item.str).join(' ');
			pageArr.push(mappedText);
			return mappedText;
		});
	};
}
const processFile = async (file) => {
	try {
		const bufferData = await fs.promises.readFile(file.filepath);
		const pages = [];
		try {
			await PdfParse(bufferData, {
				pagerender: pageRender(pages),
			});
		} catch (error) {
			console.log('error: ', error);
			throw new Error(error.message + `: ${file.originalFilename}`);
		}

		const replacedTexts = pages.join('').replaceAll(' ', '');
		if (!(replacedTexts.length > 0)) {
			console.log("couldn't extract text from the file");
			throw new Error(
				`Couldn't extract text from the file ${file.originalFilename}`,
			);
		}
	} catch (err) {
		return {
			status: true,
			message: err.message,
		};
	}

	return {
		status: false,
		message: '',
	};
};
module.exports = async function uploadBlob_v2(files) {
	//todo check whether the file can extract text
	let isError = {
		status: false,
		message: '',
	};
	for (let fileKey in files) {
		const file = files[fileKey];
		isError = await processFile(file);
		if (isError.status) {
			break;
		}
	}

	console.log('isError: ', isError);
	if (isError.status) {
		throw new Error(isError.message);
	}

	const promises = [];
	for (let fileKey in files) {
		console.log('file key: ', fileKey);
		const file = files[fileKey];
		const fileName = file.newFilename;
		const blobName = `${Date.now()}-${fileName}`;
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
		throw new Error(error.message);
		return;
	}
};
