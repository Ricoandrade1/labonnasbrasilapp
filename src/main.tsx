import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBJQl6t7LyOlAPhQ11UZCGqPv--4nfvoYs",
  authDomain: "labonnasbrasil-ab1cb.firebaseapp.com",
  projectId: "labonnasbrasil-ab1cb",
  storageBucket: "labonnasbrasil-ab1cb.firebasestorage.app",
  messagingSenderId: "1042659454330",
  appId: "1:1042659454330:web:b70f247d2172f115003ac3",
  measurementId: "G-27F961QLCG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

createRoot(document.getElementById("root")!).render(<App />);
