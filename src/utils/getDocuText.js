const PdfParse = require('pdf-parse');
const https = require('https');
const hwp = require('node-hwp');
function getDocuText(fileUrl, extension) {
	return new Promise((resolve, reject) => {
		switch (extension) {
			case 'application/pdf': {
				https.get(fileUrl, (res) => {
					let data = [];

					res.on('data', (chunk) => {
						data.push(chunk);
					});
					res.on('end', () => {
						const buffer = Buffer.concat(data);
						PdfParse(buffer)
							.then((result) => {
								console.log('pdf parse result : ', result);
								const optimizedStr = result.text.replace(/\n/g, '');
								resolve(optimizedStr);
							})
							.catch((err) => {
								console.log('err: ', err);
								reject(err);
							});
					});
				});
				break;
			}
			case 'application/octet-stream': {
				hwp.open(fileUrl, { type: 'hwp' }, (err, doc) => {
					if (err) {
						console.log('hwp open err: ', err);
						reject(err);
						return;
					}
					if (doc) {
						const text = doc.convertTo(hwp.converter.plainText);
						console.log('hwp text: ', text);

						resolve(text);
					}
				});
				break;
			}
			default: {
				console.log('unexpected extension : ', extension);
				reject('unexpexted extension');
			}
		}
	});
}
module.exports = getDocuText;
