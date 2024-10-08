require('dotenv').config();

const { SolapiMessageService } = require('solapi');
const messageService = new SolapiMessageService(
	process.env.solapiAPIKEY,
	process.env.solapiAPISECRET,
);

async function sendSolapiMessage(req, res) {
	const { text, to, from, country } = req.body;
	try {
		if (!to) {
			throw new Error('Invalid to array');
		} else {
			parsedTo = JSON.parse(to);
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
		if (!text.length) {
			throw new Error('Empty text content');
		}
		if (!country) {
			throw new Error('Invalid country');
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
				from,
				text,
				country,
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
module.exports = sendSolapiMessage;
