const selectConvIntId = require('../../model/selectConvIntId');
const selectConversation_single = require('../../model/selectConversation_single');
const selectDocument = require('../../model/selectDocuments');

async function checkConversationV2(req, res) {
  console.log('log from check conversation v2');
  try {
    const user = req.user;
    const userId = user.user_id;
    const convStringId = req.query.convId;
    const convIntId = await selectConvIntId({ convStringId });
    const selectedConv = await selectConversation_single({
      convIntId,
      userId,
    });
    const documents = await selectDocument({ convIntId });
    res.send({ selectedConv, documents });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).send(error);
  }
}
module.exports = checkConversationV2;
