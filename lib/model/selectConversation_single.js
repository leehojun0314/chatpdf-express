"use strict";

const getSql = require('../database/connection');
function selectConversation_single({
  convId
}) {
  return new Promise((resolve, reject) => {
    getSql().then(sqlPool => {
      sqlPool.request().query(`SELECT * FROM Conversation WHERE conversation_id = '${convId}'`).then(result => {
        resolve(result.recordset[0]);
      }).catch(err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
}
module.exports = selectConversation_single;