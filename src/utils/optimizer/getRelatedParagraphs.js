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
	// 2. 각 문단의 관련성 점수 계산 (문단 키워드와 질문 키워드의 교집합의 크기)
	const scoredParagraphs = paragraphs.map((paragraph) => {
		const paragraphKeywords = paragraph.keywords
			.split(', ')
			.map((keyword) =>
				keyword ? keyword.replaceAll(' ', '').toLowerCase() : '',
			);
		const intersection = paragraphKeywords.filter((keyword) =>
			questionKeywords
				.map((qk) => (qk ? qk.replaceAll(' ', '').toLowerCase() : ''))
				.includes(keyword),
		);
		// console.log('paragraph keywords : ', paragraphKeywords);
		// console.log('intersection : ', intersection);
		return {
			...paragraph,
			relevanceScore: intersection.length ? intersection.length : 0,
			intersection,
		};
	});
	// 3. 관련성 점수를 기준으로 문단들을 내림차순으로 정렬
	const sortedParagraphs = scoredParagraphs.sort(
		(a, b) => b.relevanceScore - a.relevanceScore,
	);

	// 3.1 관련성 점수가 제일 높은 문단의 다음 문단도 점수를 추가해줌.

	const bestParagraph = sortedParagraphs[0];
	// if (bestParagraph.relevanceScore === 0) {
	// 	return []; //전혀 관계가 없다는 뜻
	// }
	const continuosParagraph = scoredParagraphs.find(
		(p) => p.order_number === bestParagraph.order_number + 1,
	);
	if (continuosParagraph) {
		bestParagraph.relevanceScore += 1;
		continuosParagraph.relevanceScore += 1;
	}
	const againSortedParagraphs = sortedParagraphs.sort(
		(a, b) => b.relevanceScore - a.relevanceScore,
	);
	// sortedParagraphs.splice(1, 0, continuosParagraph);

	// 4. 문단 내용의 길이 합이 1000자 미만이 될 때까지 선택
	const selectedParagraphs = [];
	let totalLength = 0;
	const maxLength = 3500;

	for (const paragraph of againSortedParagraphs) {
		// if (paragraph.relevanceScore === 0) {
		// 	break;
		// }
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
	console.log('selectd paragraphs: ', selectedParagraphs);
	return selectedParagraphs;
}
module.exports = { getRelatedParagraphs };
