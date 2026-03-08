import { useContext } from 'react'
import { AppContext } from '../contexts/AppContext'

export function useApp() {
  const context = useContext(AppContext)
  
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  
  const { state, dispatch, ACTIONS } = context
  
  // Helper functions for common operations
  const addHabit = (habit) => dispatch({ type: ACTIONS.ADD_HABIT, payload: habit })
  const updateHabit = (habit) => dispatch({ type: ACTIONS.UPDATE_HABIT, payload: habit })
  const deleteHabit = (id) => dispatch({ type: ACTIONS.DELETE_HABIT, payload: id })
  const toggleHabit = (id, completions) => dispatch({ type: ACTIONS.TOGGLE_HABIT, payload: { id, completions } })
  
  const addTodo = (todo) => dispatch({ type: ACTIONS.ADD_TODO, payload: todo })
  const updateTodo = (todo) => dispatch({ type: ACTIONS.UPDATE_TODO, payload: todo })
  const deleteTodo = (id) => dispatch({ type: ACTIONS.DELETE_TODO, payload: id })
  const toggleTodo = (id) => dispatch({ type: ACTIONS.TOGGLE_TODO, payload: id })
  
  const addTransaction = (transaction) => dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: transaction })
  const updateTransaction = (transaction) => dispatch({ type: ACTIONS.UPDATE_TRANSACTION, payload: transaction })
  const deleteTransaction = (id) => dispatch({ type: ACTIONS.DELETE_TRANSACTION, payload: id })
  
  const setBudget = (budget) => dispatch({ type: ACTIONS.SET_BUDGET, payload: budget })
  const updateBudget = (budgets) => dispatch({ type: ACTIONS.UPDATE_BUDGET, payload: budgets })
  
  const updateSettings = (settings) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings })
  
  const loadState = (newState) => dispatch({ type: ACTIONS.LOAD_STATE, payload: newState })
  const resetState = () => dispatch({ type: ACTIONS.RESET_STATE })
  
  return {
    // State
    habits: state.habits,
    todos: state.todos,
    transactions: state.transactions,
    budgets: state.budgets,
    paymentModes: state.paymentModes,
    categories: state.categories,
    settings: state.settings,
    
    // Actions
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    setBudget,
    updateBudget,
    
    updateSettings,
    
    loadState,
    resetState
  }
}
