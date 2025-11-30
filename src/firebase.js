import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDwFUzW1f0BiV5n8LaJmofNtYFCimPlrpk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "habit-tracker-spa-prod.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "habit-tracker-spa-prod",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "habit-tracker-spa-prod.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "683288357355",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:683288357355:web:29c28286074708050051ae"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)