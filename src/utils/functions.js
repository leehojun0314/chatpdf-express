const fileSizes = {
	'1gb': 1024 * 1024 * 1024,
	'1mb': 1024 * 1024,
	'1kb': 1024,
	'1byte': 1,
};
/**
 * input 파일의 크기를 받아서 제한 크기보다 큰지 체크하는 함수
 *
 *
 * @param {int} fileSize input file.size
 * @param {string} limit fileSizes에서 적절한 크기를 고른 후 곱해서 사용한다
 * @returns {boolean} 반환값에 대한 설명입니다.
 */
function checkFileSize(fileSize, limit) {
	if (fileSize < limit) {
		return true;
	} else {
		return false;
	}
}
/**
 * pdf로 부터 변환된 텍스트를 최적화 하는 함수.
 * 변환된 텍스트의 \n 부호 삭제
 * @param {string} text 최적화 할 pdf로부터 변환된 텍스트
 */
function optimizeText(text) {
	return text.replace(/\n/g, '');
}
module.exports = {
	fileSizes,
	checkFileSize,
	optimizeText,
};
