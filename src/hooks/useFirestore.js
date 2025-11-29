import { useState, useEffect } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../firebase'

export const useFirestore = (collectionName, initialValue = []) => {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
        dataUnsubscribe = onSnapshot(
          userCollection,
          (snapshot) => {
            try {
              const items = snapshot.docs.map(doc => {
                const data = doc.data()
                return { ...data, id: data.id || doc.id }
              })
              setData(items)
              setError(null)
            } catch (err) {
              console.error('Error processing snapshot:', err)
              setError(err.message)
            } finally {
              setLoading(false)
            }
          },
          (err) => {
            console.error('Snapshot error:', err)
            setError(err.message)
            setLoading(false)
          }
        )
      } else {
        setData(initialValue)
        setLoading(false)
      }
    })
    
    return () => {
      authUnsubscribe()
      if (dataUnsubscribe) dataUnsubscribe()
    }
  }, [collectionName])

  const cleanData = (obj) => {
    const cleaned = {}
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined && obj[key] !== null) {
        cleaned[key] = obj[key]
      }
    })
    return cleaned
  }

  const addItem = async (item) => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('User not authenticated')
      if (!item?.id) throw new Error('Item must have an id')
      
      const docId = String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_')
      await setDoc(doc(db, 'users', currentUser.uid, collectionName, docId), cleanData(item))
    } catch (err) {
      console.error('Error adding item:', err)
      setError(err.message)
      throw err
    }
  }

  const updateItem = async (item) => {
    try {
      console.log('useFirestore updateItem called with:', item)
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('User not authenticated')
      if (!item?.id) throw new Error('Item must have an id')
      
      const docId = String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_')
      const cleanedData = cleanData(item)
      console.log('Saving to Firebase:', docId, cleanedData)
      await setDoc(doc(db, 'users', currentUser.uid, collectionName, docId), cleanedData)
      console.log('Firebase save complete')
    } catch (err) {
      console.error('Error updating item:', err)
      setError(err.message)
      throw err
    }
  }

  const deleteItem = async (id) => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('User not authenticated')
      if (!id) throw new Error('Item id is required')
      
      const docId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_')
      await deleteDoc(doc(db, 'users', currentUser.uid, collectionName, docId))
    } catch (err) {
      console.error('Error deleting item:', err)
      setError(err.message)
      throw err
    }
  }

  return [data, { addItem, updateItem, deleteItem, loading, error, user }]
}