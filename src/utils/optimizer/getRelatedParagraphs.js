const { extractKeyPhrase } = require('../azureLanguage/keyPhrase');
/**
 * function to optimize prompt by using keywords
 * @param {array} paragraphs
 * @param {string} userQuestion
 * @returns optimized prompt
 */
async function getRelatedParagraphs(paragraphs, userQuestion) {
	// 1. 유저 질문에서 키워드 추출
	const extractResult = await extractKeyPhrase([userQuestion]);
	const questionKeywords = extractResult[0];
	console.log('question keywords:', questionKeywords);
	// 2. 각 문단의 관련성 점수 계산 (문단 키워드와 질문 키워드의 교집합의 크기)
	const scoredParagraphs = paragraphs.map((paragraph) => {
		const paragraphKeywords = paragraph.keywords
			.split(', ')
			.map((keyword) => keyword.replaceAll(' ', ''));
		const intersection = paragraphKeywords.filter((keyword) =>
			questionKeywords.map((qk) => qk.replaceAll(' ', '')).includes(keyword),
		);
		console.log('paragraph keywords : ', paragraphKeywords);
		return {
			...paragraph,
			relevanceScore: intersection.length,
		};
	});
	// 3. 관련성 점수를 기준으로 문단들을 내림차순으로 정렬
	const sortedParagraphs = scoredParagraphs.sort(
		(a, b) => b.relevanceScore - a.relevanceScore,
	);

	// 3.1 관련성 점수가 제일 높은 문단의 다음 문단도 점수를 추가해줌.
	const bestParagraph = sortedParagraphs[0];
	bestParagraph.relevanceScore += 1;
	const continuosParagraph = sortedParagraphs.find(
		(p) => p.order_number === bestParagraph.order_number + 1,
	);
	continuosParagraph.relevanceScore += 1;
	// sortedParagraphs.splice(1, 0, continuosParagraph);
	console.log('sorted paragraphs: ', sortedParagraphs.slice(0, 3));
	// 4. 문단 내용의 길이 합이 1000자 미만이 될 때까지 선택
	const selectedParagraphs = [];
	let totalLength = 0;

	for (const paragraph of sortedParagraphs) {
		if (totalLength + paragraph.paragraph_content.length <= 3000) {
			selectedParagraphs.push(paragraph);
			totalLength += paragraph.paragraph_content.length;
		} else {
			break;
		}
	}

	return selectedParagraphs;
}
module.exports = { getRelatedParagraphs };
