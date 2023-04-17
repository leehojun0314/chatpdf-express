const insertConversation = require('../../model/insertConversation');
const insertMessage = require('../../model/insertMessage');
const insertQuestion = require('../../model/insertQuestion');
const selectUser = require('../../model/selectUser');
const createQuestion = require('../../utils/openai/createQuestion');
const generator = require('../../utils/generator');
const createSalutation = require('../../utils/openai/createSalutation');
const uploadBlob = require('../../utils/azureBlob/uploadBlob');
const getDocuText = require('../../utils/getDocuText');
const selectConversation_all = require('../../model/selectConversation_all');
const formidable = require('formidable');
const uploadBlob_v2 = require('../../utils/azureBlob/uploadBlob_v2');
const { optimizeText } = require('../../utils/functions');
const createSummary = require('../../utils/openai/createSummary');
const insertConversation_v2 = require('../../model/insertConversation_v2');
const insertDocument = require('../../model/insertDocument');
function checkFileSize(fileSize, maxSizeInBytes) {
	return fileSize <= maxSizeInBytes;
}
async function createConversationV4(req, res) {
	const user = req.user;
	console.log('user: ', user);
	try {
		//user id 가져오기 req.user에는 userid가 없음. 다른 db이기 떄문
		const selectUserResult = await selectUser({
			email: user.user_email,
			name: user.user_name,
		});
		const userId = selectUserResult.recordset[0]?.user_id;
		if (!userId) {
			res.status(404).send('unknown user id');
			return;
		}

		//파일 크기 체크
		//여러파일 //todo
		const form = formidable();
		const { status } = await new Promise((resolve, reject) => {
			form.parse(req, async (err, fields, files) => {
				console.log('files: ', files);
				if (err) {
					reject({ err });
					return;
				}
				let isSizeOk = false;
				for (let key in files) {
					const file = files[key];
					if (checkFileSize(file.size, 1024 * 180)) {
						isSizeOk = true;
					} else {
						console.log('file size exceeded.');
						console.log('file. size: ', file.size);
						console.log('limit: ', 1024 * 170);
						isSizeOk = false;
					}
				}
				if (!isSizeOk) {
					reject({ status: false });
					return;
				}
				//conversation 생성
				const conversationResult = await insertConversation_v2({
					conversationName: fields.conversationName,
					userId,
				});

				const conversationId =
					conversationResult.recordset[0].conversation_id;

				//upload
				console.log('files : ', files);
				try {
					let documents = [];
					for await (let key of Object.keys(files)) {
						const file = files[key];
						//upload s3
						const { fileUrl, extension, err } = await uploadBlob_v2(file);
						if (err) {
							console.log('upload v2 error : ', err);
							break;
						}
						//text 변환
						const allTexts = await getDocuText(fileUrl, extension);
						const optimized = optimizeText(allTexts);
						const summary = await createSummary(optimized);
						console.log('summary : ', summary);
						const insertDocumentResult = await insertDocument({
							content: optimized,
							summary: summary,
							conversationId: conversationId,
							url: fileUrl,
						});
						documents.push(insertDocumentResult.recordset[0]);
					}
					console.log('after for loop');
					resolve({ status: true });
				} catch (err) {
					console.log('err : ', err);
					reject(err);
				}
			});
		});
		if (!status) {
			res.status(413).send('file size is over 170KB');
			return;
		}

		res.status(201).send({
			message: 'conversation created',
		});
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
	}
}

module.exports = createConversationV4;
