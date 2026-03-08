// Action Types
export const ACTIONS = {
  // Habits
  ADD_HABIT: 'ADD_HABIT',
  UPDATE_HABIT: 'UPDATE_HABIT',
  DELETE_HABIT: 'DELETE_HABIT',
  TOGGLE_HABIT: 'TOGGLE_HABIT',
  
  // Todos
  ADD_TODO: 'ADD_TODO',
  UPDATE_TODO: 'UPDATE_TODO',
  DELETE_TODO: 'DELETE_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  
  // Transactions
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  
  // Budgets
  SET_BUDGET: 'SET_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  
  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // Bulk Operations
  LOAD_STATE: 'LOAD_STATE',
  RESET_STATE: 'RESET_STATE'
}

export const initialState = {
  habits: [],
  todos: [],
  transactions: [],
  budgets: {},
  paymentModes: [],
  categories: [],
  settings: {
    darkMode: false,
    hapticFeedback: true,
    notifications: true
  }
}

export function appReducer(state, action) {
  switch (action.type) {
    // Habits
    case ACTIONS.ADD_HABIT:
      return { ...state, habits: [...state.habits, action.payload] }
    
    case ACTIONS.UPDATE_HABIT:
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h)
      }
    
    case ACTIONS.DELETE_HABIT:
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload)
      }
    
    case ACTIONS.TOGGLE_HABIT:
      return {
        ...state,
        habits: state.habits.map(h => 
          h.id === action.payload.id 
            ? { ...h, completions: action.payload.completions }
            : h
        )
      }
    
    // Todos
    case ACTIONS.ADD_TODO:
      return { ...state, todos: [...state.todos, action.payload] }
    
    case ACTIONS.UPDATE_TODO:
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.payload.id ? action.payload : t)
      }
    
    case ACTIONS.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.payload)
      }
    
    case ACTIONS.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(t => 
          t.id === action.payload 
            ? { ...t, completed: !t.completed }
            : t
        )
      }
    
    // Transactions
    case ACTIONS.ADD_TRANSACTION:
      return { ...state, transactions: [...state.transactions, action.payload] }
    
    case ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      }
    
    case ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      }
    
    // Budgets
    case ACTIONS.SET_BUDGET:
      return {
        ...state,
        budgets: { ...state.budgets, [action.payload.month]: action.payload }
      }
    
    case ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budgets: { ...state.budgets, ...action.payload }
      }
    
    // Settings
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }
    
    // Bulk Operations
    case ACTIONS.LOAD_STATE:
      return { ...state, ...action.payload }
    
    case ACTIONS.RESET_STATE:
      return initialState
    
    default:
      return state
  }
}
