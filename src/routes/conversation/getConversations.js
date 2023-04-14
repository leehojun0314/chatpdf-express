const express = require('express');

const insertUser = require('../../model/insertUser');
const selectConversation = require('../../model/selectConversation_all');
const selectUser = require('../../model/selectUser');
const router = express.Router();
async function getConversations(req, res) {
	console.log('req.user : ', req.user);
	const userData = req.user;
	try {
		const selectedUserData = await selectUser({
			email: userData.user_email,
			name: userData.user_name,
		});
		console.log('selected user data : ', selectedUserData);
		let userId;
		if (selectedUserData.recordset.length === 0) {
			// 유저가 없으면
			const insertData = await insertUser({
				userName: userData.user_name,
				userData: userData.user_email,
			});
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

module.exports = getConversations;
