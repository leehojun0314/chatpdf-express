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

async function summarization(text) {
	return new Promise(async (resolve, reject) => {
		try {
			const client = new TextAnalysisClient(
				endpoint,
				new AzureKeyCredential(apiKey),
			);
			const actions = [
				{
					kind: 'ExtractiveSummarization',
				},
			];
			const poller = await client.beginAnalyzeBatch(actions, [text], 'ko');

			// poller.onProgress((state) => {
			// 	console.log('state:', state);
			// 	console.log(
			// 		`Last time the operation was updated was on: ${
			// 			poller.getOperationState().modifiedOn
			// 		}`,
			// 	);
			// });
			// console.log(
			// 	`The operation was created on ${poller.getOperationState().createdOn}`,
			// );
			// console.log(
			// 	`The operation results will expire on ${
			// 		poller.getOperationState().expiresOn
			// 	}`,
			// );

			const results = await poller.pollUntilDone();

			for await (const actionResult of results) {
				if (actionResult.kind !== 'ExtractiveSummarization') {
					reject(
						`Expected extractive summarization results but got: ${actionResult.kind}`,
					);
					throw new Error(
						`Expected extractive summarization results but got: ${actionResult.kind}`,
					);
				}
				if (actionResult.error) {
					const { code, message } = actionResult.error;
					reject(message);
					throw new Error(`Unexpected error (${code}): ${message}`);
				}
				for (const result of actionResult.results) {
					console.log(`- Document ${result.id}`);
					if (result.error) {
						const { code, message } = result.error;
						throw new Error(`Unexpected error (${code}): ${message}`);
					}
					console.log('Summary:');
					console.log(
						result.sentences.map((sentence) => sentence.text).join('\n'),
					);
					const summary = result.sentences
						.map((sentence) => sentence.text)
						.join('\n');
					resolve(summary);
				}
			}
		} catch (error) {
			console.log('summarization error: ', error);
			reject(error);
		}
	});
}

module.exports = { summarization };
