// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "agentix-b30a5.firebaseapp.com",
  projectId: "agentix-b30a5",
  storageBucket: "agentix-b30a5.firebasestorage.app",
  messagingSenderId: "679173617624",
  appId: "1:679173617624:web:d35bd23c7565b214cd64ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);

export const googleProvider= new GoogleAuthProvider()