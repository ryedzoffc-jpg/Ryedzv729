import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4LmonPFC7CfjD3Y3xZbVsUWr-WEKrN0c",
  authDomain: "ryedzoffc-2d40f.firebaseapp.com",
  projectId: "ryedzoffc-2d40f",
  storageBucket: "ryedzoffc-2d40f.firebasestorage.app",
  messagingSenderId: "1053013297416",
  appId: "1:1053013297416:web:07741babea215a8bb5c4bd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
