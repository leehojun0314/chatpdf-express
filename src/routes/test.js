const express = require('express');
const router = express.Router();
const configs = require('../../configs');
const { Configuration, OpenAIApi, o } = require('openai');
const configuration = new Configuration({
	apiKey: configs.openai.apiKey,
	organization: configs.openai.organization,
});
const openai = new OpenAIApi(configuration);
const { encode, decode } = require('js-base64');
const getSql = require('../database/connection');
const createQuestion = require('../utils/openai/createQuestion');
const createSalutation = require('../utils/openai/createSalutation');
const PdfParse = require('pdf-parse');
const https = require('https');
const formidable = require('formidable');
const axios = require('axios');
const {
	checkFileSize,
	fileSizes,
	optimizeText,
} = require('../utils/functions');
const getDocuText = require('../utils/getDocuText');
const { extractKeyPhrase } = require('../utils/azureLanguage/keyPhrase');
const { summarization } = require('../utils/azureLanguage/summarization');
const sendToAi_vola_stream = require('../utils/openai/sendToAi__vola_stream');
const updateConvStatusModel = require('../model/updateConvStatusModel');
const getKeywordGPT = require('../utils/openai/getKeywordGPT');
const { keyPhrase_summ } = require('../utils/azureLanguage/keyPhrase_summ');
const { v4: uuidv4 } = require('uuid');
function generateConvId() {
	const currentTime = Date.now();
	const uniqueId = uuidv4();
	return `${uniqueId}-${currentTime}`;
}
router.get('/uniqueId', (req, res) => {
	const id = generateConvId();
	console.log('id: ', id);
	res.send({ id });
});
router.get('/keyword', async (req, res) => {
	try {
		const answer = await getKeywordGPT(
			'what right does apple reserve in the agreement?',
		);
		console.log('anser : ', answer);
		res.send(answer);
	} catch (error) {
		res.status(500).send(error);
	}
});
router.get('/updateStatus', async (req, res) => {
	try {
		await updateConvStatusModel({
			convId: 121,
			status: 'created',
			userId: 30,
		});
		res.send('ok');
	} catch (err) {
		res.status(500).send(err);
	}
});
async function processArrayInBatches(arr, batchSize) {
	const keyphrasesResult = [];
	const summarizationsResult = [];
	for (let i = 0; i < arr.length; i += batchSize) {
		const batch = arr.slice(i, i + batchSize);
		const { extractedKeyPhrases, summarizations } = await keyPhrase_summ(
			batch,
		);
		keyphrasesResult.push(extractedKeyPhrases);
		summarizationsResult.push(summarizations);
	}

	return { keyphrasesResult, summarizationsResult };
}
function pageRender(pageArr) {
	return (pageData) => {
		let renderOptions = {
			normalizeWhitespace: true,
		};

		return pageData.getTextContent(renderOptions).then((textContent) => {
			const mappedText = textContent.items.map((item) => item.str).join('');
			// console.log('mapped text: ', mappedText);
			pageArr.push(mappedText);
			return mappedText;
			// return {
			// 	pageNumber: pageData.pageNumber,
			// 	text: textContent.items.map((item) => item.str).join(' '),
			// };

			//줄바꿈 될때마다 \n을 추가하는 코드
			// let lastY,
			// 	text = '';
			// for (let item of textContent.items) {
			// 	if (lastY == item.transform[5] || !lastY) {
			// 		text += item.str;
			// 	} else {
			// 		text += '\n' + item.str;
			// 	}
			// 	lastY = item.transform[5];
			// }
			// return text;
		});
	};
	// 텍스트 레이어를 추출합니다.
}

router.get('/paragraph', async (req, res) => {
	const convId = req.query.convId;
	const orderNum = req.query.order;
	try {
		const sqlPool = await getSql();
		const result = await sqlPool
			.request()
			.query(
				`SELECT * FROM Paragraph WHERE conversation_id = ${convId} AND order_number = ${orderNum}`,
			);
		res.send(result.recordset);
	} catch (error) {
		console.log('error :', error);
		res.status(500).send(error);
	}
});
router.get('/pagination', (req, res) => {
	console.log('pagination');
	// const fileUrl =
	// 	'https://jemishome.blob.core.windows.net/blob/1682579274354-ce2fbc6df38e2ac7e2812e400'; //언론관
	const fileUrl =
		'https://jemishome.blob.core.windows.net/blob/1682580377970-3bd8a6a99452f73102b878a00';
	https.get(fileUrl, (parseRes) => {
		let data = [];

		parseRes.on('data', (chunk) => {
			data.push(chunk);
		});
		parseRes.on('end', () => {
			const buffer = Buffer.concat(data);
			const pages = [];
			PdfParse(buffer, { pagerender: pageRender(pages) })
				.then((document) => {
					console.log('document: ', document);
					console.log('pages:', pages);
					const textArr = document.text.split('\n\n');
					// const filteredArr = textArr.filter((el) => (el ? true : false));
					// console.log('filtered : ', filteredArr);
					// for await(let text of filteredArr){
					// 	extractKeyPhrase(text)

					// }
					// Promise.all(
					// 	filteredArr.map((text) => {
					// 		return extractKeyPhrase([text]);
					// 	}),
					// ).then((extracted) => {
					// 	console.log('extracted : ', extracted);
					// 	res.send({
					// 		filteredArr,
					// 		extracted,
					// 	});
					// });
					// processArrayInBatches(filteredArr, 25)
					// 	.then((result) => {
					// 		console.log('result :', result);
					// 		res.send(result);
					// 	})
					// 	.catch((err) => {
					// 		console.log('err :', err);
					// 		res.status(500).send(err);
					// 	});
					// res.send({ textArr, text: document.text });
					res.send({ pages, text: document.text });
				})
				.catch((error) => {
					console.error('Error while parsing PDF:', error);
					res.send(error);
				});
		});
	});
});
router.get('/', (req, res) => {
	console.log('hello');
	res.send('world');
});
router.get('/ssetest2', async (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
	await sendToAi_vola_stream(
		'오늘의 날씨는 좋다.', //지문의 내용
		'안녕?',
		async ({ text, isEnd, error }) => {
			if (error) {
				console.log('error : ', error);
				res.status(500).send(error);
				return;
			}
			if (isEnd) {
				res.end('');
			} else {
				// res.write(text);
				res.write(JSON.stringify({ text, arr: [1, 2, 3] }) + '\n');
			}
		},
	);
});
router.get('/ssetest', (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream');
	// res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Content-Encoding', 'none');
	res.setHeader('X-Accel-Buffering', 'no');
	// res.writeHead(200, {
	// 	'Content-Type': 'application/json',
	// });
	let i = 0;
	console.log('here is stream');
	const interval = setInterval(() => {
		console.log('interval called i :', i);
		res.write('hi');
		i++;
		if (i > 10) {
			console.log('end called');
			clearInterval(interval);
			res.end();
		}
	}, 500);
});
router.get('/titletest', async (req, res) => {
	const fileUrl =
		'https://jemishome.blob.core.windows.net/blob/1680896870987-3af321008623482acd0e62700';
	console.log('file url : ', fileUrl);
	const allTexts = await getDocuText(fileUrl, 'application/pdf');
	const optimized = optimizeText(allTexts);
	const completion = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'user',
				content: `
				다음 지문을 읽고 해당 내용에 대한 제목을 지어줘.
				${optimized}
			`,
			},
		],
	});
	const answer = completion.data.choices[0].message;
	console.log('usage: ', completion.data.usage);
	console.log('answer : ', answer);
	res.send(answer);
});
router.get('/sumtest', async (req, res) => {
	// const { fileUrl, extension } = await uploadBlob(req);
	// const fileUrl =
	// 	'https://jemishome.blob.core.windows.net/blob/%E1%84%89%E1%85%B5%E1%86%AB%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%B5%E1%84%8C%E1%85%A1.pdf';
	// console.log('file url : ', fileUrl);
	// const allTexts = await getDocuText(fileUrl, 'application/pdf');
	// const optimized = optimizeText(allTexts);
	const text = `취재원에 대해 기본적인 예의를 갖추어라 .  취 재원과 언쟁을 벌 이거나 취 재원의 기분을 상하게 하지마라 . 그래서 손 해보는 것은 기  자이다 . 특 히 전화 취 재는 취 재원이 가장 기분 나 빠 하는 것 중 에 하나이다 . 7) 자신의 취재처에 대해서는 전문가가 되라 .  그래야만 좋 은 글이 나올 수 있다 . 그러기 위해서는 평소  자신의 생활이 취 재활동이 될   필요가 있다 . 8) 애매한 것은 확실하게 조사 , 검토해 보고 그래도 명확하지 않으면 생략하는 것이 좋다 . 9) 모든 사실은 양면성 , 이중성을 가지고 있다 .  사 실 에 관 련 된 모든 견해를 통 합 , 반영해야 한다 . 판단을 독 자에게 맡 기는 내용의 기사는  신문의 신 뢰 도를 높 인다 . (4) 취재시 기자의 자세  기자의 많 은 취 재 작업 은 신문에 어 울 리는 기 획 을 낳 고 생산적인 글을 탄 생시 킨 다 .  취 재는 보도기사 담당자만이 또 는 보도면을 담당하는 취 재부 기자만이 하는 것이 아니다 . 기자라면 누 구나 부서에 상관없이 수행해야 하는 것이다 . 그래서 흔히 기자라는 말대신 ‘ 취 재기자 ’ 라는 말을 많 이 쓴 다 .  사 실 은 취 재부기자 보다 학술부 , 문화부 , 사회부 기자에게 취 재의 중 요성은 더  크다 . 전문 적이고 광 범위한 취 재를 바 탕 으로 독 자들에게 항 상 새 로운 소 식을 조 직 화하여 알려주어야 하며 , 새 로운 생 각 을 정리하여 적당한 필자를 선 정 , 생산적인 논 의를 지면에 반영해야 하는 것이 학술부 , 문화부 , 사회부 기자들이 담당하고 있는 일의 주된 내용이기 때문이다 .  취 재를 제대로 하지 않는 기자들이 만 드 는 매체는 일상적이고 피 상적인 소 식의 나 열 과 진 부하고 상투적인 글들로 가 득찬  재미없는 신문이 되고 만다 . 이런 언론을 보고 ‘ 기자들이 아 르 바이 트 한 , 즉 여가 선 용한 언론 ’ 이라고 한다 .  이런 매체를 만 드 는 것은 독 자의 알 권 리를 올바로 충족 시 키 고 또  그들의 의사를 앞 서서 대변한다는 기자정신의 대의를 스스 로 저 버 리는 것이다 . 그리고 아 까 운 시간과 물자 , 노 력 을 헛 되이 하는 것이다 . 신문기자는 먼 저 지면의 소중 함을 뼈 저리게 느 껴 야 한다 .  취 재를 한다는 것 , 이것은 ‘ 취 재기자 ’ 가 수 많 은 뉴스 재 료  속에서 어떤 것을 뽑 아내느냐 하 는 문제로 써  가장 어 렵 고 중 요한 문제이다 . 취 재기자는 시야를 넓 혀 이제 껏  찾지`;
	const summarized = await summarization(text);
	res.send({ summarized, text });
});
router.post('/uploadtest', async (req, res) => {
	const form = formidable();
	form.parse(req, async (err, fields, files) => {
		if (err) {
			console.log('formidable err: ', err);
			res.status(500).send(err);
			return;
		}
		console.log('files: ', files);
		//check size of the files
		let isSizeOk = false;
		for (let key in files) {
			const file = files[key];
			const checkSizeResult = checkFileSize(
				file.size,
				fileSizes['1mb'] * 10,
			);
			if (!checkSizeResult) {
				isSizeOk = false;
			}
		}
		if (!isSizeOk) {
			res.status(400).send('one or more files exceed 10mb in size.');
			return;
		}
		//파일 별 요약생성

		//각각의 파일의 원본 텍스트와 요약본을 포함한 컬럼을 테이블에 삽입
		//요약본들을 모아서 하나의 목차를 생성. 목차에는 요약본의 내용과 그 요약본에 해당하는 파일 아이디 기입.
		//해당 목차를 conversation에 매핑. 목차와 conversation은 1대1 관계

		res.send('hello world');
	});
});
router.get('/create_answer', async (req, res) => {
	const completion = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'user',
				content: `
				목차 : 1.생각과 인격 (page 72) 2.생각과 환경 (page 77) 3.생각과 건강 (page 91)
				질문 : 생각과 건강에 관한 페이지는 몇페이지야?
				대답 : 91
				
				목차 : 1.언론관이란? (page 2) 2.기자란 누구인가? (page 6) 3.뉴스란 무엇인가? (page 11)
				질문 : 기자에 관한 페이지는 몇페이지야? 
				대답 : `,
			},
		],
	});
	console.log(completion.data.choices[0].message);
	res.send(completion.data.choices[0].message);
});
router.get('/getText', async (req, res) => {
	const fileUrl =
		'https://jemixhomefileupload.s3.ap-northeast-2.amazonaws.com/uploads/QA.pdf';
	console.log('file url:', fileUrl);
	https.get(fileUrl, (fileResponse) => {
		let data = [];
		fileResponse.on('data', (chunk) => {
			console.log('chunk: ', chunk);
			data.push(chunk);
		});
		fileResponse.on('end', () => {
			const buffer = Buffer.concat(data);
			console.log('buffer: ', buffer);
			PdfParse(buffer)
				.then((result) => {
					const optimizedStr = result.text.replace(/\n/g, '');
					console.log('optimized str : ', optimizedStr);
					res.send(optimizedStr);
				})
				.catch((err) => {
					console.log('err: ', err);
					res.status(500).send(err);
				});
		});
		fileResponse.on('error', (err) => {
			console.log('file response error: ', err);
			res.status(500).send(err);
		});
	});
});
router.get('/question', async (req, res) => {
	console.log('/question');
	try {
		const answers = await createQuestion(
			'생활관   관련   Q&A  1.   생활관   벌점상쇄는   어떻게   해야하나요 ?  생활관   벌점상쇄는   상점활동을   통해   상쇄가능합니다 .   상점활동으로는   관생수칙   상벌  점표를   참고하시기   바랍니다 .   주요활동으로   선거   참여 ,   비교과   프로그램 ( 상점   부여   혜  택   제시된 )   이수 ,   벌점상쇄   청소봉사   등이   있습니다 .  2.   생활관비   환불을   받으려는데   어떻게   신청해야하나요 ?  신청   절차는   ‘ 생활관   홈페이지 - 커뮤니티 - 서식자료실 ’   메뉴에서   생활관   퇴사 ( 환불 ) 신청  서   다운로드   후   작성하시어   납부증명서 ,   통장사본을   첨부하여   생활관   통합행정실로  직접   제출   또는   등기우편으로   보내시면   됩니다 .  [ 참고 ]   관생수칙에   근거하여   생활관비는   미입사시   전액   환불되고   중도퇴사시   잔여일수  30 일이상   일때만   잔여기간에   대한   환불이   됩니다 .   중도퇴사   환불   내역은   관생수칙을  참고하시기   바랍니다 .  3.   생활관으로   택배를   받으려는데   주소를   어떻게   쓰면   될까요 ?  충북   괴산군   괴산읍   문무로   85   ( 남자   또는   여자 ) 생활관   ( 이하   본인   호실   기재 ) 하시면  됩니다 .  [ 참고 ]   택배   수령은   남자생활관은   1 동   2 층   택배실 ,   여자생활관은   6 동   2 층   택배실에서  수령하시면   됩니다 .( 추후   변경가능 )  4.   점호는   어떻게   진행하나요 ?  매일   23 시   호실에서   층장학생들이   대면   점호를   실시합니다 .   점호불참시   벌점   ? 3 점   부  과됩니다 .  5.   외박신청은   어떻게   신청하나요 ?  통합정보시스템   로그인   후   ‘ 기숙사 - 외박신청 ’   메뉴에서   필수사항 ( 외박사유 ,   외박출발  일 ,   외박복귀일   등 )   입력하여   신청버튼   클릭하시면   됩니다 .  [ 참고 ]   외박당일   19 시까지   신청되며   외박횟수는   제한없고   1 회   4 일까지   가능합니다 .  단 ,   금 ~ 일요일 / 공휴일   전일   및   공휴일은   외박신청   제외합니다 .   외박신청을   안할   경우  무단외박   벌점   ? 3 점   부과됩니다 .',
		);
		const answersArr = answers.split('\n');

		res.send(answers);
	} catch (error) {
		console.log('error: ', error);
		res.send(error);
	}
});
router.get('/salutation', async (req, res) => {
	console.log('its here');
	try {
		const text =
			'생활관   관련   Q&A  1.   생활관   벌점상쇄는   어떻게   해야하나요 ?  생활관   벌점상쇄는   상점활동을   통해   상쇄가능합니다 .   상점활동으로는   관생수칙   상벌  점표를   참고하시기   바랍니다 .   주요활동으로   선거   참여 ,   비교과   프로그램 ( 상점   부여   혜  택   제시된 )   이수 ,   벌점상쇄   청소봉사   등이   있습니다 .  2.   생활관비   환불을   받으려는데   어떻게   신청해야하나요 ?  신청   절차는   ‘ 생활관   홈페이지 - 커뮤니티 - 서식자료실 ’   메뉴에서   생활관   퇴사 ( 환불 ) 신청  서   다운로드   후   작성하시어   납부증명서 ,   통장사본을   첨부하여   생활관   통합행정실로  직접   제출   또는   등기우편으로   보내시면   됩니다 .  [ 참고 ]   관생수칙에   근거하여   생활관비는   미입사시   전액   환불되고   중도퇴사시   잔여일수  30 일이상   일때만   잔여기간에   대한   환불이   됩니다 .   중도퇴사   환불   내역은   관생수칙을  참고하시기   바랍니다 .  3.   생활관으로   택배를   받으려는데   주소를   어떻게   쓰면   될까요 ?  충북   괴산군   괴산읍   문무로   85   ( 남자   또는   여자 ) 생활관   ( 이하   본인   호실   기재 ) 하시면  됩니다 .  [ 참고 ]   택배   수령은   남자생활관은   1 동   2 층   택배실 ,   여자생활관은   6 동   2 층   택배실에서  수령하시면   됩니다 .( 추후   변경가능 )  4.   점호는   어떻게   진행하나요 ?  매일   23 시   호실에서   층장학생들이   대면   점호를   실시합니다 .   점호불참시   벌점   ? 3 점   부  과됩니다 .  5.   외박신청은   어떻게   신청하나요 ?  통합정보시스템   로그인   후   ‘ 기숙사 - 외박신청 ’   메뉴에서   필수사항 ( 외박사유 ,   외박출발  일 ,   외박복귀일   등 )   입력하여   신청버튼   클릭하시면   됩니다 .  [ 참고 ]   외박당일   19 시까지   신청되며   외박횟수는   제한없고   1 회   4 일까지   가능합니다 .  단 ,   금 ~ 일요일 / 공휴일   전일   및   공휴일은   외박신청   제외합니다 .   외박신청을   안할   경우  무단외박   벌점   ? 3 점   부과됩니다 .';
		const answer = await createSalutation(text);
		console.log('answer : ', answer);
		res.send(answer);
	} catch (error) {
		console.log('error : ', error);
		res.send(error);
	}
});
router.get('/getMessages_conversationName', async (req, res) => {
	const convId = req.query.convId;
	if (!convId) {
		res.send('hello');
		return;
	}
	getSql().then((sqlPool) => {
		const request = sqlPool.request();
		request
			.query(
				`SELECT conversation_name FROM Conversation WHERE conversation_id=${convId}`,
			)
			.then((result) => {
				console.log('result: ', result);
				const conversationName = result.recordset[0].conversation_name;

				return new Promise((resolve, reject) => {
					request
						.query(
							`SELECT * FROM Message WHERE conversation_id=${convId}`,
						)
						.then((result2) => {
							resolve({ conversationName, messages: result2.recordset });
						})
						.catch((err) => {
							reject(err);
						});
				});
			})

			.then((result2) => {
				console.log('result2 : ', result2);
				res.send(result2);
			})
			.catch((err) => {
				console.log('err: ', err);
				res.send(err);
			});
	});
});

// router.get('/', (req, res) => {
// 	const totalSize = 10000000; // 전체 파일 크기
// 	const chunkSize = 1000000; // 한 번에 보낼 청크 크기
// 	let progress = 0; // 전송된 크기

// 	res.setHeader('Content-Type', 'application/json');
// 	res.setHeader('Content-Length', totalSize);

// 	const sendChunk = () => {
// 		const remainingSize = totalSize - progress;
// 		const chunk = Math.min(chunkSize, remainingSize);
// 		if (chunk <= 0) {
// 			res.end();
// 			return;
// 		}

// 		const data = {
// 			progress: progress,
// 			total: totalSize,
// 		};

// 		res.write(JSON.stringify(data));

// 		progress += chunk;
// 		setTimeout(sendChunk, 1000); // 임의의 시간 간격으로 전송
// 	};

// 	sendChunk();
// });
module.exports = router;
