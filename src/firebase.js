import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDwFUzW1f0BiV5n8LaJmofNtYFCimPlrpk",
  authDomain: "habit-tracker-spa-prod.firebaseapp.com",
  projectId: "habit-tracker-spa-prod",
  storageBucket: "habit-tracker-spa-prod.firebasestorage.app",
  messagingSenderId: "683288357355",
  appId: "1:683288357355:web:29c28286074708050051ae"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)