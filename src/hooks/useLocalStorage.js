import { useState, useEffect } from 'react'
import { getData, setData as saveData, markAsChanged } from '../utils/dataStorage'

export const useLocalStorage = (key, initialValue = []) => {
  const [data, setData] = useState(() => getData(key, initialValue))

  useEffect(() => {
    const success = saveData(key, data)
    if (success) {
      markAsChanged()
    }
  }, [key, data])

  const addItem = (item) => {
    setData(prev => [...prev, item])
  }

  const updateItem = (item) => {
    setData(prev => prev.map(i => i.id === item.id ? item : i))
  }

  const deleteItem = (id) => {
    setData(prev => prev.filter(i => i.id !== id))
  }

  return [data, { addItem, updateItem, deleteItem, loading: false }]
}
