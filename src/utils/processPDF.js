const pdfParse = require('pdf-parse');
// const fetch = require("node-fetch");
const fetch = require('node-fetch');

async function processPDF(url) {
	const response = await fetch(url);
	const buffer = await response.arrayBuffer();

	const data = await pdfParse(buffer);

	// Create a conversation object
	const conversation = {
		fileUrl: url,
		title: data.info.Title,
		author: data.info.Author,
		numberOfPages: data.numpages,
	};

	// Process each page
	const pages = [];
	const paragraphs = [];

	const pageTexts = data.text.split('\n\n');

	pageTexts.forEach((pageText, pageNumber) => {
		pages.push({
			pageNumber: pageNumber + 1,
			text: pageText,
		});

		// Split the text into paragraphs
		const pageParagraphs = pageText.split(/\n\n+/);

		pageParagraphs.forEach((paragraphText, index) => {
			paragraphs.push({
				pageNumber: pageNumber + 1,
				orderNumber: index,
				text: paragraphText,
			});
		});
	});

	console.log('Conversation: ', conversation);
	console.log('Pages: ', pages);
	console.log('Paragraphs: ', paragraphs);
}

// Replace with your PDF URL
const pdfUrl = 'https://example.com/your-pdf-file.pdf';
processPDF(pdfUrl);
