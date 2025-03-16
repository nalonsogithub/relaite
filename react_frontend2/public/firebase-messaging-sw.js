importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyDsHXDkIQ5J-_npsH0Q3cZ3v3to7czY_AA",
  authDomain: "realestaite-cc5ce.firebaseapp.com",
  projectId: "realestaite-cc5ce",
  storageBucket: "realestaite-cc5ce.appspot.com",
  messagingSenderId: "1078019945943",
  appId: "1:1078019945943:web:520fd1064eda3506aa8792",
  measurementId: "G-JNRGBH6QK9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
