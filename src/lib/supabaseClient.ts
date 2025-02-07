// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJQl6t7LyOlAPhQ11UZCGqPv--4nfvoYs",
  authDomain: "labonnasbrasil-ab1cb.firebaseapp.com",
  projectId: "labonnasbrasil-ab1cb",
  storageBucket: "labonnasbrasil-ab1cb.firebasestorage.app",
  messagingSenderId: "1042659454330",
  appId: "1:1042659454330:web:b70f247d2172f115003ac3",
  measurementId: "G-27F961QLCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
