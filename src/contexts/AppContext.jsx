import { createContext, useReducer, useEffect } from 'react'
import { appReducer, initialState, ACTIONS } from '../reducers/appReducer'

export const AppContext = createContext()

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

  // Sync to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem('habits', JSON.stringify(state.habits))
    } catch (error) {
      console.error('Error saving habits:', error)
    }
  }, [state.habits])

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(state.todos))
    } catch (error) {
      console.error('Error saving todos:', error)
    }
  }, [state.todos])

  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(state.transactions))
    } catch (error) {
      console.error('Error saving transactions:', error)
    }
  }, [state.transactions])

  useEffect(() => {
    try {
      localStorage.setItem('budgets', JSON.stringify(state.budgets))
    } catch (error) {
      console.error('Error saving budgets:', error)
    }
  }, [state.budgets])

  useEffect(() => {
    try {
      localStorage.setItem('paymentModes', JSON.stringify(state.paymentModes))
    } catch (error) {
      console.error('Error saving payment modes:', error)
    }
  }, [state.paymentModes])

  useEffect(() => {
    try {
      localStorage.setItem('todoCategories', JSON.stringify(state.categories))
    } catch (error) {
      console.error('Error saving categories:', error)
    }
  }, [state.categories])

  useEffect(() => {
    try {
      localStorage.setItem('settings', JSON.stringify(state.settings))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }, [state.settings])

  return (
    <AppContext.Provider value={{ state, dispatch, ACTIONS }}>
      {children}
    </AppContext.Provider>
  )
}
