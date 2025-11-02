import { useState, useEffect } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../firebase'

export const useFirestore = (collectionName, initialValue = []) => {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let dataUnsubscribe = null
    
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      
      if (dataUnsubscribe) {
        dataUnsubscribe()
      }
      
      if (user) {
        const userCollection = collection(db, 'users', user.uid, collectionName)
        dataUnsubscribe = onSnapshot(userCollection, (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setData(items)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
    
    return () => {
      authUnsubscribe()
      if (dataUnsubscribe) dataUnsubscribe()
    }
  }, [collectionName])

  const addItem = async (item) => {
    const currentUser = auth.currentUser
    if (!currentUser) return
    const docId = String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_')
    await setDoc(doc(db, 'users', currentUser.uid, collectionName, docId), { ...item, id: docId })
  }

  const updateItem = async (item) => {
    const currentUser = auth.currentUser
    if (!currentUser) return
    const docId = String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_')
    await setDoc(doc(db, 'users', currentUser.uid, collectionName, docId), { ...item, id: docId })
  }

  const deleteItem = async (id) => {
    const currentUser = auth.currentUser
    if (!currentUser) return
    const docId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_')
    await deleteDoc(doc(db, 'users', currentUser.uid, collectionName, docId))
  }

  return [data, { addItem, updateItem, deleteItem, loading, user }]
}