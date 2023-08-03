const updateConvStatusModel = require('../../model/updateConvStatusModel');
const selectConversation_single = require('../../model/selectConversation_single');
const selectConvIntId = require('../../model/selectConvIntId');
const deleteBlob = require('../../utils/azureBlob/deleteBlob');
const deleteParagraph_single = require('../../utils/pinecone/deleteParagraph_single');
const deleteDocument = require('../../model/deleteDocument');
async function deleteFiles(req, res) {
	const user = req.user;
	const userId = user.user_id;
	let convStringId, filesToDelete, convIntId;
	convStringId = req.body?.convStringId;
	filesToDelete = req.body?.deleteFiles;
	console.log('files to delete: ', filesToDelete);
	try {
		if (!convStringId) {
			throw new Error('No conversation id is given');
		}
		if (!filesToDelete.length) {
			throw new Error('No delete IDs is given');
		}
		convIntId = await selectConvIntId({ convStringId });
		const singleConv = await selectConversation_single({ convIntId, userId });
		if (!convIntId) {
			throw new Error('Invalid conversation id');
		}
		console.log('single conv: ', singleConv);
		if (!singleConv) {
			throw new Error('Only owner of conversation can delete file');
		}
	} catch (error) {
		console.log('error: ', error);
		res.status(500).send(error);
		return;
	}

	try {
		//update conversation status
		await updateConvStatusModel({
			convIntId,
			status: 'analyzing',
			userId: userId,
		});

		const promiseArr = [];
		for (let fileToDelete of filesToDelete) {
			const promiseEl = new Promise((resolve, reject) => {
				console.log('file to delete: ', fileToDelete);
				//delete blob
				const fileUrl = fileToDelete.document_url;
				deleteBlob(fileUrl)
					.then((deleteBlobRes) => {
						console.log('deleteBlobRes: ', deleteBlobRes);
						return deleteParagraph_single({
							convIntId,
							docuId: fileToDelete.document_id,
						});
					})
					.then((deleteParaRes) => {
						console.log('delete para res: ', deleteParaRes);
						return deleteDocument({
							docuId: fileToDelete.document_id,
							convIntId: convIntId,
						});
					})
					.then((dbDeleteRes) => {
						console.log('db delete Res: ', dbDeleteRes);
						resolve(true);
					})
					.catch((err) => {
						console.log('err: ', err);
						reject();
					});
			});
			promiseArr.push(promiseEl);
		}
		const promiseRes = await Promise.all(promiseArr);
		console.log('promise all response : ', promiseRes);
		await updateConvStatusModel({
			convIntId,
			status: 'created',
			userId: userId,
		});
		res.status(201).send({
			message: 'file deleted',
		});
	} catch (err) {
		console.log('error: ', err);
		// await updateConvStatusModel({
		// 	convIntId,
		// 	status: 'error',
		// 	userId,
		// });
		await updateConvStatusModel({
			convIntId,
			status: 'created',
			userId: userId,
		});
		res.status(500).send(err);
	}
}
function deleteProcess(fileToDelete, convIntId) {
	return async () => {
		console.log('file to delete: ', fileToDelete);
		//delete blob
		const fileUrl = fileToDelete.document_url;
		await deleteBlob(fileUrl);

		//delete from vector store
		const pineconeRes = await deleteParagraph_single({
			convIntId,
			docuId: fileToDelete.document_id,
		});
		console.log('pinecone Res: ', pineconeRes);

		//delete from database
		const dbDeleteRes = await deleteDocument({
			docuId: fileToDelete.document_id,
			convIntId: convIntId,
		});
		console.log('db delete res: ', dbDeleteRes);
	};
}
module.exports = deleteFiles;
