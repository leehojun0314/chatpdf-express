require('dotenv').config();

const { SolapiMessageService } = require('solapi');
const messageService = new SolapiMessageService(
	process.env.solapiAPIKEY,
	process.env.solapiAPISECRET,
);

async function SendSolapiKakao(req, res) {
	const { templateId, variables, to, from } = req.body;
	let parsedTo, parsedVariables;

	try {
		if (!templateId) {
			throw new Error('Invalid template id');
		}
		if (!variables) {
			throw new Error('Invalid variables');
		} else {
			parsedVariables = JSON.parse(variables);
		}
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
		let destinationArr;
		destinationArr = parsedTo.map((element) => {
			return {
				to: element,
				from: from,
				kakaoOptions: {
					pfId: process.env.solapiPFID,
					templateId: templateId,
					variables: parsedVariables,
				},
			};
		});
		const messageRes = await messageService.send(destinationArr);
		console.log('message res: ', messageRes);
		res.send('message sent');
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error.message);
	}
}
module.exports = SendSolapiKakao;
