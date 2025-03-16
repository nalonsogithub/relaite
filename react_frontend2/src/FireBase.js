import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsHXDkIQ5J-_npsH0Q3cZ3v3to7czY_AA",
  authDomain: "realestaite-cc5ce.firebaseapp.com",
  projectId: "realestaite-cc5ce",
  storageBucket: "realestaite-cc5ce.appspot.com",
  messagingSenderId: "1078019945943",
  appId: "1:1078019945943:web:520fd1064eda3506aa8792",
  measurementId: "G-JNRGBH6QK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
