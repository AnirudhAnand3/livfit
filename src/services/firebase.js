import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALivqjF8e-JnyaK2tX9-4lBVdqGJZ0ZPc",
  authDomain: "livfit-mad.firebaseapp.com",
  projectId: "livfit-mad",
  storageBucket: "livfit-mad.firebasestorage.app",
  messagingSenderId: "1025722062343",
  appId: "1:1025722062343:web:b27c1b3949f43d0a19bca2",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
