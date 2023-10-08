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
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Accel-Buffering', 'no');
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
		let fileIndex = 0;
		for await (let fileToDelete of filesToDelete) {
			res.write(
				JSON.stringify({
					message: `Deleting ${fileToDelete.document_name}`,
					status: 'delete',
					progress: `${Math.floor(
						(fileIndex / filesToDelete.length) * 100,
					)}`,
				}) + '#',
			);
			await processFile(fileToDelete, convIntId);
			fileIndex++;
		}
		await updateConvStatusModel({
			convIntId,
			status: 'created',
			userId: userId,
		});
		res.write(JSON.stringify({ message: 'All files have been deleted' }));
		res.end();
		// res.status(201).send({
		// 	message: 'file deleted',
		// });
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
		// res.status(500).send(err);
		res.write(JSON.stringify({ message: err }));
		res.end();
	}
}
async function processFile(fileToDelete, convIntId) {
	console.log('file to delete: ', fileToDelete);
	//not uploading file to Ncloud
	// const fileUrl = fileToDelete.document_url;
	// const deleteBlobRes = await deleteBlob(fileUrl);
	// console.log('deleteBlobRes: ', deleteBlobRes);

	const deleteParaRes = await deleteParagraph_single({
		convIntId,
		docuId: fileToDelete.document_id,
	});
	console.log('delete para res: ', deleteParaRes);

	const dbDeleteRes = await deleteDocument({
		docuId: fileToDelete.document_id,
		convIntId: convIntId,
	});
	console.log('db delete Res: ', dbDeleteRes);
}

module.exports = deleteFiles;
