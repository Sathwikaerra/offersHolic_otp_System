import { Expo } from 'expo-server-sdk';

let expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
});

const sendPushNotifications = async (tokens, messageData) => {
  let messages = [];

  for (let token of tokens) {
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is invalid`);
      continue;
    }

    messages.push({
      to: token,
      sound: 'default',
      body: messageData.body,
      data: messageData.data,
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
};
// const sendPushNotificationToUser = async (userId, messageData) => {
//   const user = await User.findById(userId);
//   const pushToken = user.deviceToken;
//   await sendPushNotifications([pushToken], messageData);
// }

export default sendPushNotifications;
