const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log(vapidKeys);
// {
//   publicKey: 'YOUR_PUBLIC_VAPID_KEY',
//   privateKey: 'YOUR_PRIVATE_VAPID_KEY'
// }
