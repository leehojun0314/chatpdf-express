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
const generator = require('../utils/generator');
const PdfParse = require('pdf-parse');
const https = require('https');
const formidable = require('formidable');
const uploadBlob = require('../utils/azureBlob/uploadBlob');

const {
	checkFileSize,
	fileSizes,
	optimizeText,
} = require('../utils/functions');
const getDocuText = require('../utils/getDocuText');
router.get('/', (req, res) => {
	console.log('hello');
	res.send('world');
});
router.get('/ssetest', (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream');
	// res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Content-Encoding', 'none');
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
router.post('/sumtest', async (req, res) => {
	// const { fileUrl, extension } = await uploadBlob(req);
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
				다음 지문을 읽고 주요 내용을 요약해줘. 뒷부분의 내용이 초중반의 내용과 관련이 없으면 생략해도 돼.
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
		const answer = await createSalutation(generator.systemMessage(text));
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
