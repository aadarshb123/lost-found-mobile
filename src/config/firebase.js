import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDi75pwmfSJtgOhG5Fes9mhvfL7_xnV28M",
  authDomain: "lost-and-found-e7634.firebaseapp.com",
  projectId: "lost-and-found-e7634",
  storageBucket: "lost-and-found-e7634.firebasestorage.app",
  messagingSenderId: "1047684379967",
  appId: "1:1047684379967:web:5cc2482526b3e907db4f8a",
  measurementId: "G-FJ0K8F0H4V"
};

// Initialize Firebase (prevent re-initialization)
let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { app, auth };
