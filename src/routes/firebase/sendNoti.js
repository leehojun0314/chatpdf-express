const admin = require('firebase-admin');
const { config } = require('dotenv');
config();
// const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
// const serviceAccountObj = JSON.parse(serviceAccount);
// console.log('service account: ', serviceAccountObj);
const serviceAccount = require('../../../dtizen-ai-firebase-adminsdk.json');
// console.log('service account: ', serviceAccountObj);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
async function sendNoti(req, res) {
  const { FCMTokens, notiBody, notiTitle } = req.body;
  console.log('send noti: ', req.body);
  try {
    if (!FCMTokens) {
      throw new Error('Invalid tokens');
    }
    if (!notiBody) {
      throw new Error('Invalid body');
    }
    if (!notiTitle) {
      throw new Error('Invalid title');
    }

    const messages = [];
    for (let token of FCMTokens) {
      const message = {
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'bingbong.aiff',
            },
          },
        },

        notification: {
          body: notiBody,
          title: notiTitle,
        },
        token: token,
      };
      messages.push(message);
    }
    const sendRes = await admin.messaging().sendEach(messages);

    res.status(200).send(sendRes);
  } catch (error) {
    console.log('error:', error);
    res.status(500).send(error);
  }
}
module.exports = sendNoti;
