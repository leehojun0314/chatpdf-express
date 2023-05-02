const configs = require('../../../configs');
const selectConvIntId = require('../../model/selectConvIntId');
const selectParagraph_all = require('../../model/selectParagraph_all');
const selectUser = require('../../model/selectUser');
const updateSalutation = require('../../model/updateSalutation');
const createSalutation_stream = require('../../utils/openai/createSalutation_stream');

async function getSalutation(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
	let user = req.user;
	const convStringId = req.query.convStringId;
	try {
		const userResult = await selectUser({
			email: user.user_email,
			name: user.use_name,
			profileImg: user.imgUrl || user.picture || '',
		});
		console.log('user result: ', userResult);
		const userId = userResult.recordset[0].user_id;
		const convIntId = await selectConvIntId({ convStringId: convStringId });
		const selectParagraphsResult = await selectParagraph_all({
			convIntId,
		});
		const paragraphs = selectParagraphsResult.recordset;
		const joinedParagraph = paragraphs
			.map((p) => p.paragraph_content)
			.join(' ')
			.slice(0, configs.createSalutationPLength);
		console.log('joined paragraph : ', joinedParagraph);
		await createSalutation_stream(
			joinedParagraph,
			async ({ text, isEnd, error }) => {
				if (error) {
					console.log('openai error : ', error);
					res.status(500).send(error);
					return;
				}
				if (isEnd) {
					//salutation insert
					await updateSalutation({
						convIntId: convIntId,
						salutation: text,
						userId: userId,
					});

					res.end('');
				} else {
					// res.write(text);
					res.write(text);
				}
			},
		);
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}
module.exports = getSalutation;
