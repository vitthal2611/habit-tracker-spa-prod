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
      if (!currentUser) {
        const error = new Error('Please sign in to save data')
        setError(error.message)
        throw error
      }
      if (!item?.id) {
        const error = new Error('Item must have an id')
        setError(error.message)
        throw error
      }
      
      const docId = String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_')
      await setDoc(doc(db, 'users', currentUser.uid, collectionName, docId), cleanData(item))
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('Error adding item:', err)
      const friendlyMessage = err.code === 'permission-denied' 
        ? 'Permission denied. Please check your authentication.'
        : err.message
      setError(friendlyMessage)
      throw err
    }
  }

  const updateItem = async (item) => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        const error = new Error('Please sign in to save data')
        setError(error.message)
        throw error
      }
      if (!item?.id) {
        const error = new Error('Item must have an id')
        setError(error.message)
        throw error
      }
      
      const docId = String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_')
      const cleanedData = cleanData(item)
      await setDoc(doc(db, 'users', currentUser.uid, collectionName, docId), cleanedData)
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('Error updating item:', err)
      const friendlyMessage = err.code === 'permission-denied' 
        ? 'Permission denied. Please check your authentication.'
        : err.message
      setError(friendlyMessage)
      throw err
    }
  }

  const deleteItem = async (id) => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        const error = new Error('Please sign in to delete data')
        setError(error.message)
        throw error
      }
      if (!id) {
        const error = new Error('Item id is required')
        setError(error.message)
        throw error
      }
      
      const docId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_')
      await deleteDoc(doc(db, 'users', currentUser.uid, collectionName, docId))
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('Error deleting item:', err)
      const friendlyMessage = err.code === 'permission-denied' 
        ? 'Permission denied. Please check your authentication.'
        : err.message
      setError(friendlyMessage)
      throw err
    }
  }

  return [data, { addItem, updateItem, deleteItem, loading, error, user }]
}