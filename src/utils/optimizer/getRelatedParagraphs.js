const configs = require('../../../configs');
const { extractKeyPhrase } = require('../azureLanguage/keyPhrase');
const getKeywordGPT = require('../openai/getKeywordGPT');

/**
 * function to optimize prompt by using keywords
 * @param {array} paragraphs
 * @param {string} userQuestion
 * @returns optimized prompt
 */
async function getRelatedParagraphs(paragraphs, userQuestion) {
	// 1. 유저 질문에서 키워드 추출
	// const extractResult = await extractKeyPhrase([userQuestion]);
	const questionKeywords = await getKeywordGPT(userQuestion);
	console.log('question keywords:', questionKeywords);
	const optimizedKeywords =
		typeof questionKeywords === 'object'
			? questionKeywords.map((keywords) =>
					keywords.replaceAll(' ', '').toLowerCase(),
			  )
			: [];
	console.log('optimized keywords: ', optimizedKeywords);
	const scoredParagraphs = paragraphs.map((paragraph) => {
		const relevanceScore = calculateRelevanceScore(
			optimizedKeywords,
			paragraph,
		);

		return {
			...paragraph,
			relevanceScore,
		};
	});
	// 3. 관련성 점수를 기준으로 문단들을 내림차순으로 정렬
	const sortedParagraphs = scoredParagraphs.sort(
		(a, b) => b.relevanceScore - a.relevanceScore,
	);
	// console.log(
	// 	'sorted paras: ',
	// 	sortedParagraphs.map((para) => {
	// 		return { order: para.order_number, score: para.relevanceScore };
	// 	}),
	// );
	// 3.1 관련성 점수가 제일 높은 문단의 다음 문단도 점수를 추가해줌.

	const bestParagraph = sortedParagraphs[0];
	// if (bestParagraph.relevanceScore === 0) {
	// 	return []; //전혀 관계가 없다는 뜻
	// }
	const continuosParagraph = scoredParagraphs.find(
		(p) => p.order_number === bestParagraph.order_number + 1,
	);
	if (continuosParagraph) {
		bestParagraph.relevanceScore += 2;
		continuosParagraph.relevanceScore += 2;
	}
	const againSortedParagraphs = sortedParagraphs.sort(
		(a, b) => b.relevanceScore - a.relevanceScore,
	);
	// sortedParagraphs.splice(1, 0, continuosParagraph);

	// 4. 문단 내용의 길이 합이 1000자 미만이 될 때까지 선택
	const selectedParagraphs = [];
	let totalLength = 0;
	const maxLength = configs.relatedParagraphLength;

	for (const paragraph of againSortedParagraphs) {
		if (paragraph.relevanceScore === 0) {
			break;
		}
		if (totalLength + paragraph.paragraph_content.length <= maxLength) {
			selectedParagraphs.push(paragraph);
			totalLength += paragraph.paragraph_content.length;
		} else {
			// 남은 길이를 계산하고, 해당 길이만큼 잘라낸 paragraph_content를 저장합니다.
			const remainingLength = maxLength - totalLength;
			const truncatedContent = paragraph.paragraph_content.substring(
				0,
				remainingLength,
			);
			selectedParagraphs.push({
				...paragraph,
				paragraph_content: truncatedContent,
			});
			totalLength += truncatedContent.length;
			break;
		}
	}
	console.log('total length : ', totalLength);
	console.log('selectd paragraphs: ', selectedParagraphs);
	return selectedParagraphs;
}
function calculateRelevanceScore(questionKeyPhrases, paragraph) {
	let score = 0;
	let uniqueMatches = 0;

	for (const keyPhrase of questionKeyPhrases) {
		let keyPhraseCount = 0;
		let position = paragraph.paragraph_content.indexOf(keyPhrase);

		while (position !== -1) {
			keyPhraseCount++;
			position = paragraph.paragraph_content.indexOf(
				keyPhrase,
				position + 1,
			);
		}

		if (keyPhraseCount > 0) {
			score += keyPhraseCount; // 중복 횟수에 따라 가산점 추가
			uniqueMatches += 1;
		}
	}
	//page가 키워드에 들어가 있을 경우
	if (questionKeyPhrases.includes('page')) {
		const pageKeywordIndex = questionKeyPhrases.indexOf('page');
		const frontEl = questionKeyPhrases[pageKeywordIndex - 1];
		const isFrontNumber = !isNaN(frontEl);
		const backEl = questionKeyPhrases[pageKeywordIndex + 1];
		const isBackNumber = !isNaN(backEl);
		if (isFrontNumber && frontEl == paragraph.order_number + 1) {
			score += 100;
		} else if (isBackNumber && backEl == paragraph.order_number + 1) {
			score += 100;
		}
	}

	score += uniqueMatches * 4; // 각기 다른 문자가 포함될 때마다 5점 (기존 1점 + 추가 4점)

	return score;
}
module.exports = { getRelatedParagraphs };
