import { useState, useEffect } from 'react'

export const useLocalStorage = (key, initialValue = []) => {
  const [data, setData] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data))
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
