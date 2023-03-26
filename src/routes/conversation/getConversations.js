const express = require('express');
// const authenticate = require('../middleware/authenticate');

const insertUser = require('../../model/insertUser');
const selectConversation = require('../../model/selectConversation_all');
const selectUser = require('../../model/selectUser');
const router = express.Router();
async function getConversations(req, res) {
	console.log('req.user : ', req.user);
	const userData = req.user;
	try {
		const selectedUserData = await selectUser({ email: userData.userEmail });
		console.log('selected user data : ', selectedUserData);
		let userId;
		if (selectedUserData.recordset.length === 0) {
			// 유저가 없으면
			const insertData = await insertUser(
				userData.userName,
				userData.userEmail,
			);
			userId = insertData.recordset[0].user_id;
		} else {
			//유저가 있으면
			userId = selectedUserData.recordset[0].user_id;
		}
		console.log('user id : ', userId);
		const selectConverData = await selectConversation({ userId });
		res.status(200).json(selectConverData.recordset);
	} catch (error) {
		console.log('error : ', error);
		res.status(400).send(error);
	}
}
// router.get('/', authenticate, async (req, res) => {
// 	console.log('req.user : ', req.user);
// 	const userData = req.user;
// 	try {
// 		const selectedUserData = await selectUser({ email: userData.userEmail });
// 		console.log('selected user data : ', selectedUserData);
// 		let userId;
// 		if (selectedUserData.recordset.length === 0) {
// 			// 유저가 없으면
// 			const insertData = await insertUser(
// 				userData.userName,
// 				userData.userEmail,
// 			);
// 			userId = insertData.recordset[0].user_id;
// 		} else {
// 			//유저가 있으면
// 			userId = selectedUserData.recordset[0].user_id;
// 		}
// 		console.log('user id : ', userId);
// 		const selectConverData = await selectConversation({ userId });
// 		res.status(200).json(selectConverData.recordset);
// 	} catch (error) {
// 		console.log('error : ', error);
// 		res.status(400).send(error);
// 	}
// });
module.exports = getConversations;
