"use strict";

const selectMessage = require('../../model/selectMessage');
async function getMessages(req, res) {
  const conversationId = req.query.convId || '';
  console.log('conversation Id : ', conversationId);
  if (!conversationId) {
    res.status(404).send('please enter a valid conversation id');
    return;
  }
  try {
    const messagesResult = await selectMessage({
      conversationId
    });
    const shiftedMessages = [...messagesResult.recordset];
    shiftedMessages.shift();
    res.status(200).json(shiftedMessages);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}
module.exports = getMessages;