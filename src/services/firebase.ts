import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAV7Bk7lOM4L-8oQPfzBS8ls_UtNIfrNd4",
  authDomain: "bookstoreapp-2a0d2.firebaseapp.com",
  projectId: "bookstoreapp-2a0d2",
  storageBucket: "bookstoreapp-2a0d2.firebasestorage.app",
  messagingSenderId: "1013062760114",
  appId: "1:1013062760114:web:9602233508bc199d2d7bab"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);