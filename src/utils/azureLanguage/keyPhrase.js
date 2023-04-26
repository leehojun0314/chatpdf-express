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

async function extractKeyPhrase(texts) {
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
			];
			const poller = await client.beginAnalyzeBatch(actions, texts, 'ko'); // for one by one
			const actionResults = await poller.pollUntilDone();
			console.log('action results: ', actionResults);
			const extractedKeyPhrases = [];

			for await (const actionResult of actionResults) {
				if (actionResult.error) {
					reject({ error: actionResult.error });
					throw new Error(`Unexpected error`);
				}
				switch (actionResult.kind) {
					case 'KeyPhraseExtraction': {
						for (const doc of actionResult.results) {
							extractedKeyPhrases.push(doc.keyPhrases);
						}
						break;
					}
				}
			}
			resolve(extractedKeyPhrases);
		} catch (err) {
			console.log('extract key phrase err : ', err);
			reject(err);
		}
	});
}

module.exports = { extractKeyPhrase };
