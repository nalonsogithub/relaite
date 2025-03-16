const webpush = require('web-push');

// Set VAPID details
const vapidKeys = {
  publicKey: 'BBU1R4DKI9JK7uJ8gQlKc_et9ml6sekQ3wdJQTVYeWyp2BJoM9F-ZRyhoOH-dE4DWcz6nXVVoKY9iYBE2qrdLfE',
  privateKey: 'UG9j4fZCWbwhZw9wScSb7vgWwFmAVX22fS6s2SA5WWI'
};

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Example function to send push notification
const sendPushNotification = (subscription, dataToSend) => {
  webpush.sendNotification(subscription, dataToSend)
    .then(response => console.log('Push notification sent successfully', response))
    .catch(error => console.error('Error sending push notification', error));
};

// Example usage
const pushSubscription = {
  endpoint: 'YOUR_SUBSCRIPTION_ENDPOINT',
  keys: {
    p256dh: 'YOUR_P256DH_KEY',
    auth: 'YOUR_AUTH_KEY'
  }
};

const payload = JSON.stringify({
  title: 'Test Notification',
  body: 'This is a test notification'
});

// Send the notification
sendPushNotification(pushSubscription, payload);

module.exports = sendPushNotification;
