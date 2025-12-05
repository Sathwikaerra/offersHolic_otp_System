import { Expo } from "expo-server-sdk";

let expo = new Expo();

export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.log("❌ Invalid Expo Push Token:", expoPushToken);
    return;
  }

  const messages = [{
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data,
  }];

  try {
    let receipts = await expo.sendPushNotificationsAsync(messages);
    console.log("📩 Notification Receipts:", receipts);
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
  }
}
