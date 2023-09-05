const { SolapiMessageService } = require('solapi');
const messageService = new SolapiMessageService(
	'NCSH3WZ0XQLGLLUW',
	'JRLNCEBBJRFGUBWRCBF52QKXM9CISPQJ',
);

async function sendSolapiMessage(req, res) {
	console.log('send solapi message');
	const body = req.body;
	console.log('body: ', body);
	const { pfid, templateId, variables, to, from } = req.body;
	let parsedTo, parsedVariables;
	let testObj = {
		'#{홍길동}': '이호준',
		'#{url}': 'https://www.naver.com',
	};
	let stringifiedTestObj = JSON.stringify(testObj);
	console.log('test obj : ', stringifiedTestObj);
	console.log('variables: ', variables);
	try {
		if (!pfid) {
			throw new Error('Invalid pfid');
		}
		if (!templateId) {
			throw new Error('Invalid template id');
		}
		if (!variables) {
			throw new Error('Invalid variables');
		} else {
			parsedVariables = JSON.parse(variables);
		}
		console.log('variables 통과');
		console.log(variables);
		if (!to) {
			throw new Error('Invalid to array');
		} else {
			parsedTo = JSON.parse(to);
			console.log('parsed to : ', parsedTo);
			if (!Array.isArray(parsedTo)) {
				throw new Error('Parameter to is not an array');
			}
			if (!parsedTo.length) {
				throw new Error('Empty to array');
			}
		}
		if (!from) {
			throw new Error('Invalid from number');
		}
	} catch (error) {
		console.log('error: ', error.message);
		res.status(400).send(error.message);
		return;
	}

	try {
		const destinationArr = parsedTo.map((element) => {
			return {
				to: element,
				from: from,
				kakaoOptions: {
					pfId: pfid,
					templateId: templateId,
					variables: parsedVariables,
				},
			};
		});
		console.log('destination arr: ', destinationArr);
		const messageRes = await messageService.send(destinationArr);
		// const messageSendRes = await messageService.send({
		// 	to : element,
		// 	from : from,
		// 	kakaoOptions : {
		// 		pfId : pfid,
		// 		templateId : templateId,
		// 		variables : variables
		// 	}
		// })
		// const solapiRes = await messageService.send([
		// 	{
		// 	to: '01047117871',
		// 	from: '0222978637',
		// 	kakaoOptions: {
		// 		pfId: 'KA01PF2305030200191463QOM1QLeFYb',
		// 		templateId: 'KA01TP221025083117992xkz17KyvNbr',
		// 		// 치환문구가 없을 때의 기본 형태
		// 		variables: {
		// 			'#{홍길동}': '이호준',
		// 			'#{url}': 'https://www.naver.com',
		// 		},
		// 	},
		// },
		// 	{
		// 		to: '01034737871',
		// 		from: '0222978637',
		// 		text: '사실 뻥임',
		// 		kakaoOptions: {
		// 			pfId: 'KA01PF2305030200191463QOM1QLeFYb',
		// 			templateId: 'KA01TP221025083117992xkz17KyvNbr',
		// 			// 치환문구가 없을 때의 기본 형태
		// 			variables: {
		// 				'#{홍길동}': '이호준',
		// 				'#{url}': 'https://www.naver.com',
		// 			},
		// 		},
		// 	},
		// 	{
		// 		to: '01033117871',
		// 		from: '0222978637',
		// 		kakaoOptions: {
		// 			pfId: 'KA01PF2305030200191463QOM1QLeFYb',
		// 			templateId: 'KA01TP221025083117992xkz17KyvNbr',
		// 			// 치환문구가 없을 때의 기본 형태
		// 			variables: {
		// 				'#{홍길동}': '이호준',
		// 				'#{url}': 'https://www.naver.com',
		// 			},
		// 		},
		// 	},
		// ]);
		console.log('message res: ', messageRes);
		res.send('message sent');
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error.message);
	}
}
module.exports = sendSolapiMessage;
