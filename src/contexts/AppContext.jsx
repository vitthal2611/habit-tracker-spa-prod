import { createContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { appReducer, initialState, ACTIONS } from '../reducers/appReducer'

export const AppContext = createContext()

const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    // Load from localStorage on init
    try {
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      const todos = JSON.parse(localStorage.getItem('todos') || '[]')
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
      const budgets = JSON.parse(localStorage.getItem('budgets') || '{}')
      const paymentModes = JSON.parse(localStorage.getItem('paymentModes') || '[]')
      const categories = JSON.parse(localStorage.getItem('todoCategories') || '[]')
      const settings = JSON.parse(localStorage.getItem('settings') || '{}')
      
      return {
        ...initial,
        habits,
        todos,
        transactions,
        budgets,
        paymentModes,
        categories,
        settings: { ...initial.settings, ...settings }
      }
    } catch (error) {
      console.error('Error loading state:', error)
      return initial
    }
  })

  const writeQueue = useRef({})
  const isSyncing = useRef(false)

  const debouncedSave = useCallback(
    debounce((key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        delete writeQueue.current[key]
      } catch (error) {
        console.error(`Error saving ${key}:`, error)
      }
    }, 500),
    []
  )

  // Sync to localStorage with debouncing
  useEffect(() => {
    writeQueue.current.habits = state.habits
    debouncedSave('habits', state.habits)
  }, [state.habits, debouncedSave])

  useEffect(() => {
    writeQueue.current.todos = state.todos
    debouncedSave('todos', state.todos)
  }, [state.todos, debouncedSave])

  useEffect(() => {
    writeQueue.current.transactions = state.transactions
    debouncedSave('transactions', state.transactions)
  }, [state.transactions, debouncedSave])

  useEffect(() => {
    writeQueue.current.budgets = state.budgets
    debouncedSave('budgets', state.budgets)
  }, [state.budgets, debouncedSave])

  useEffect(() => {
    writeQueue.current.paymentModes = state.paymentModes
    debouncedSave('paymentModes', state.paymentModes)
  }, [state.paymentModes, debouncedSave])

  useEffect(() => {
    writeQueue.current.todoCategories = state.categories
    debouncedSave('todoCategories', state.categories)
  }, [state.categories, debouncedSave])

  useEffect(() => {
    writeQueue.current.settings = state.settings
    debouncedSave('settings', state.settings)
  }, [state.settings, debouncedSave])

  // Flush writes on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        Object.entries(writeQueue.current).forEach(([key, value]) => {
          try {
            localStorage.setItem(key, JSON.stringify(value))
          } catch (error) {
            console.error(`Error flushing ${key}:`, error)
          }
        })
        writeQueue.current = {}
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Flush writes on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      Object.entries(writeQueue.current).forEach(([key, value]) => {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.error(`Error flushing ${key}:`, error)
        }
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, ACTIONS }}>
      {children}
    </AppContext.Provider>
  )
}
