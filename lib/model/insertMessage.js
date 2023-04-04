"use strict";

const getSql = require('../database/connection');
function insertMessage({
  message,
  conversationId,
  sender,
  messageOrder,
  userId
}) {
  return new Promise((resolve, reject) => {
    getSql().then(sqlPool => {
      sqlPool.request().input('message', message).input('conversation_id', conversationId).input('sender', sender).input('message_order', messageOrder).input('user_id', userId).query(`INSERT INTO Message (message, conversation_id, sender, message_order, user_id, created_time)
    VALUES (@message, @conversation_id, @sender, @message_order, @user_id, GETDATE())`).then(result => {
        resolve(result);
      }).catch(err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
}
module.exports = insertMessage;