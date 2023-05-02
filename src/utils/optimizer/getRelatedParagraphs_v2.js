require('dotenv').config();
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
function extractSemanticIndex(text) {
	const words = tokenizer.tokenize(text);
	const stemmedWords = words.map((word) => stemmer.stem(word.toLowerCase()));
	const semanticIndex = {};

	stemmedWords.forEach((word) => {
		if (!semanticIndex[word]) {
			semanticIndex[word] = 1;
		} else {
			semanticIndex[word]++;
		}
	});

	return semanticIndex;
}
/**
 * function to optimize prompt by using keywords
 * @param {array} paragraphs
 * @param {string} userQuestion
 * @returns optimized prompt
 */
async function getRelatedParagraphs_v2(paragraphs, userQuestion) {
	// 1. 유저 질문에서 키워드 추출

	const scoredParagraphs = paragraphs.map((paragraph) => {
		const relevanceScore = calculateRelevanceScore(
			userQuestion,
			paragraph.paragraph_content,
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
	const maxLength = process.env.RELATED_PARAGRAPH_LENGTH;

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
function calculateRelevanceScore(userQuestion, paragraph_content) {
	const questionSemanticIndex = extractSemanticIndex(userQuestion);
	const paragraphSemanticIndex = extractSemanticIndex(paragraph_content);

	let score = 0;

	for (const word in questionSemanticIndex) {
		if (paragraphSemanticIndex.hasOwnProperty(word)) {
			score += questionSemanticIndex[word] * paragraphSemanticIndex[word];
		}
	}

	return score;
}
module.exports = { getRelatedParagraphs_v2 };
