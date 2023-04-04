"use strict";

const getSql = require('../database/connection');
function selectMessage({
  conversationId
}) {
  return new Promise((resolve, reject) => {
    getSql().then(sqlPool => {
      sqlPool.request().query(`SELECT * FROM Message WHERE conversation_id = '${conversationId}' ORDER BY message_order ASC`).then(result => {
        resolve(result);
      }).catch(err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
}
module.exports = selectMessage;