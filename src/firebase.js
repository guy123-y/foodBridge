import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// הדבק כאן את ההגדרות של הפרויקט שלך מ-Firebase Console
const firebaseConfig = {
  
  apiKey: "AIzaSyCzzBPMJIdNTDi1BUflopF8jz5eOLaI-_g",
  authDomain: "foodbridge-af9f4.firebaseapp.com",
  projectId: "foodbridge-af9f4",
  storageBucket: "foodbridge-af9f4.firebasestorage.app",
  messagingSenderId: "335876470365",
  appId: "1:335876470365:web:c714c428dbecdbe78fbfb4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
