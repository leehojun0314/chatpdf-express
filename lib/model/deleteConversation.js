"use strict";

const getSql = require('../database/connection');
function deleteConversation(convId) {
  getSql().then(sqlPool => {
    sqlPool.request().input('conversation_id', convId).query('DELETE FROM Conversation WHERE conversation_id=@conversation_id').query('DELETE FROM Message WHERE conversation_id=@conversation_id').then(result => {
      console.log('result', result);
    }).catch(error => {
      console.log('error: ', error);
    });
  });

  //need to delete the s3 file too
}

module.exports = deleteConversation;