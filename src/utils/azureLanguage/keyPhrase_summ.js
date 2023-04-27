/**
 * This sample program extracts a summary of two sentences at max from an article.
 * For more information, see the feature documentation: {@link https://learn.microsoft.com/azure/cognitive-services/language-service/summarization/overview}
 *
 * @summary extracts a summary from an article
 */

const {
	AzureKeyCredential,
	TextAnalysisClient,
} = require('@azure/ai-language-text');

// Load the .env file if it exists
require('dotenv').config();
// You'll need to set these environment variables or edit the following values
const endpoint = process.env['LANGUAGE_ENDPOINT'];
const apiKey = process.env['LANGUAGE_API_KEY'];

async function keyPhrase_summ(texts) {
	return new Promise(async (resolve, reject) => {
		try {
			const client = new TextAnalysisClient(
				endpoint,
				new AzureKeyCredential(apiKey),
			);
			const actions = [
				{
					kind: 'KeyPhraseExtraction',
					modelVersion: 'latest',
				},
				{
					kind: 'ExtractiveSummarization',
				},
			];
			const poller = await client.beginAnalyzeBatch(actions, texts, 'ko'); // for one by one
			const actionResults = await poller.pollUntilDone();
			const extractedKeyPhrases = [];
			const summarizations = [];
			for await (const actionResult of actionResults) {
				if (actionResult.error) {
					reject({ error: actionResult.error });
					// throw new Error(`Unexpected error`);
				}
				switch (actionResult.kind) {
					case 'KeyPhraseExtraction': {
						for (const doc of actionResult.results) {
							console.log('keyphrase extraction doc : ', doc);
							extractedKeyPhrases.push(doc.keyPhrases);
						}
						break;
					}
					case 'ExtractiveSummarization': {
						for (const result of actionResult.results) {
							console.log(`- Document ${result.id}`);
							if (result.error) {
								const { code, message } = result.error;
								console.log('error : ', message);
								return;
								// throw new Error(`Unexpected error (${code}): ${message}`);
							}

							const summary = result.sentences
								.map((sentence) => sentence.text)
								.join('\n');

							console.log('summary : ', summary);
							summarizations.push(summary);
						}
					}
				}
			}
			resolve({ extractedKeyPhrases, summarizations });
		} catch (err) {
			console.log('extract key phrase err : ', err);
			reject(err);
		}
	});
}

module.exports = { keyPhrase_summ };
