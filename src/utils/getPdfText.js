// import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';
// export default async function getPDFText(fileUrl) {
// 	const pdf = await pdfjsLib.getDocument(fileUrl).promise;

// 	// // 페이지에서 텍스트 추출하기
// 	// const page = await pdf.getPage(1);
// 	// const textContent = await page.getTextContent();
// 	// const text = textContent.items.map((s) => s.str).join(' ');

// 	//모든 페이지에서 텍스트 추출하기
// 	const numPages = pdf.numPages;
// 	const textPromises = [];
// 	for (let i = 1; i <= numPages; i++) {
// 		textPromises.push(
// 			pdf.getPage(i).then((page) => {
// 				return page.getTextContent();
// 			}),
// 		);
// 	}
// 	const texts = await Promise.all(textPromises);
// 	let allTexts = '';
// 	texts.forEach((textContent) => {
// 		allTexts += textContent.items.map((s) => s.str).join(' ');
// 	});
// 	return allTexts;
// }
// import PdfParse from 'pdf-parse';
// pdf-parse 모듈을 가져온다.
const PdfParse = require('pdf-parse');

// AWS SDK를 가져온다.
const AWS = require('aws-sdk');

// 설정 파일을 가져온다.
const configs = require('../../configs');

// AWS S3 객체를 생성한다.
const s3 = new AWS.S3({
	accessKeyId: configs.s3.AWS_ACCESS_KEY_ID,
	secretAccessKey: configs.s3.AWS_SECRET_ACCESS_KEY,
});

// 파일 URL을 받아서 PDF 파일의 텍스트를 반환하는 함수를 내보낸다.
export default async function getPDFText(fileUrl) {
	// Promise 객체를 생성한다.
	return new Promise((resolve, reject) => {
		// S3에서 객체를 가져온다.
		s3.getObject(
			{
				Bucket: 'jemixhomefileupload',
				Key: 'uploads/QA.pdf',
			},
			(err, data) => {
				if (err) {
					console.log('s3 error: ', err);
					reject(err);
				} else {
					console.log('data: ', data);

					// pdf-parse 모듈을 사용하여 PDF 파일의 텍스트를 추출한다.
					PdfParse(data.Body)
						.then((result) => {
							console.log('result: ', result);
							resolve(result.text);
						})
						.catch((err) => {
							console.log('err : ', err);
							reject(err);
						});
				}
			},
		);
	});
}
