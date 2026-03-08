// Data Storage Utility with validation, backup, and migration

const STORAGE_KEYS = {
  habits: 'habits',
  todos: 'todos',
  expenses: 'expenses',
  budgets: 'budgets',
  transactions: 'transactions',
  settings: 'settings',
  savingsGoals: 'savingsGoals',
  recurringTemplates: 'recurringTemplates',
  bills: 'bills',
  financialGoals: 'financialGoals',
  currency: 'currency',
  habitNotes: 'habitNotes',
  todoCategories: 'todoCategories',
  yearlyBudgets: 'yearlyBudgets'
}

const SCHEMA_VERSION = 1

// Module groupings
const MODULE_KEYS = {
  habits: ['habits', 'habitNotes'],
  todos: ['todos', 'todoCategories'],
  expenses: ['expenses', 'transactions', 'yearlyBudgets', 'settings', 'savingsGoals', 'recurringTemplates', 'bills', 'financialGoals', 'currency'],
  budgets: ['budgets', 'yearlyBudgets']
}

// Validation schemas
const validators = {
  habits: (data) => Array.isArray(data) && data.every(h => 
    h.id && typeof h.id === 'string' && (h.habit || h.newHabit)
  ),
  todos: (data) => Array.isArray(data) && data.every(t => 
    t.id && typeof t.id === 'string' && t.text
  ),
  expenses: (data) => Array.isArray(data) && data.every(e => 
    e.id && typeof e.amount === 'number' && e.amount >= 0
  ),
  budgets: (data) => Array.isArray(data) && data.every(b => 
    b.category && typeof b.amount === 'number'
  ),
  transactions: (data) => Array.isArray(data) && data.every(t => 
    t.id && typeof t.amount === 'number' && t.date
  ),
  settings: (data) => Array.isArray(data),
  savingsGoals: (data) => Array.isArray(data) && data.every(g => 
    g.id && g.name && typeof g.target === 'number'
  ),
  recurringTemplates: (data) => Array.isArray(data),
  bills: (data) => Array.isArray(data),
  financialGoals: (data) => Array.isArray(data),
  currency: (data) => Array.isArray(data),
  habitNotes: (data) => Array.isArray(data),
  todoCategories: (data) => Array.isArray(data),
  yearlyBudgets: (data) => Array.isArray(data)
}

// Get data from localStorage with validation
export const getData = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    const parsed = JSON.parse(item)
    const validator = validators[key]
    if (validator && !validator(parsed)) {
      console.warn(`Invalid data for ${key}, using default`)
      return defaultValue
    }
    return parsed
  } catch (error) {
    console.error(`Error reading ${key}:`, error)
    return defaultValue
  }
}

// Set data to localStorage with validation
export const setData = (key, value) => {
  try {
    const validator = validators[key]
    if (validator && !validator(value)) {
      throw new Error(`Invalid data format for ${key}`)
    }
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error writing ${key}:`, error)
    return false
  }
}

// Export all data
export const exportAllData = () => {
  const data = {}
  Object.values(STORAGE_KEYS).forEach(key => {
    data[key] = getData(key, [])
  })
  return {
    version: SCHEMA_VERSION,
    exportDate: new Date().toISOString(),
    data
  }
}

// Export specific module data
export const exportModuleData = (module) => {
  const keys = MODULE_KEYS[module] || []
  const data = {}
  keys.forEach(key => {
    data[key] = getData(key, [])
  })
  
  return {
    version: SCHEMA_VERSION,
    module,
    exportDate: new Date().toISOString(),
    data
  }
}

// Import data with validation
export const importData = (importedData) => {
  try {
    if (!importedData.version || !importedData.data) {
      throw new Error('Invalid import format')
    }
    
    // Migrate if needed
    const migratedData = migrateData(importedData)
    
    const results = {}
    Object.entries(migratedData.data).forEach(([key, value]) => {
      if (STORAGE_KEYS[key]) {
        results[key] = setData(key, value)
      }
    })
    
    return { success: true, results }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Create backup
export const createBackup = () => {
  const backup = exportAllData()
  const backupKey = `backup_${Date.now()}`
  try {
    localStorage.setItem(backupKey, JSON.stringify(backup))
    
    // Keep only last 5 backups
    const allKeys = Object.keys(localStorage)
    const backupKeys = allKeys.filter(k => k.startsWith('backup_')).sort()
    if (backupKeys.length > 5) {
      backupKeys.slice(0, backupKeys.length - 5).forEach(k => localStorage.removeItem(k))
    }
    
    return { success: true, backupKey }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// List all backups
export const listBackups = () => {
  const allKeys = Object.keys(localStorage)
  return allKeys
    .filter(k => k.startsWith('backup_'))
    .map(k => {
      try {
        const backup = JSON.parse(localStorage.getItem(k))
        return {
          key: k,
          date: backup.exportDate,
          timestamp: parseInt(k.split('_')[1])
        }
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.timestamp - a.timestamp)
}

// Restore from backup
export const restoreBackup = (backupKey) => {
  try {
    const backup = localStorage.getItem(backupKey)
    if (!backup) throw new Error('Backup not found')
    
    const parsed = JSON.parse(backup)
    return importData(parsed)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Delete backup
export const deleteBackup = (backupKey) => {
  try {
    localStorage.removeItem(backupKey)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Data migration utility
export const migrateData = (data) => {
  const currentVersion = data.version || 0
  let migratedData = { ...data }
  
  // Migration from v0 to v1
  if (currentVersion < 1) {
    // Ensure all habits have required fields
    if (migratedData.data?.habits) {
      migratedData.data.habits = migratedData.data.habits.map(h => ({
        ...h,
        id: h.id || `habit_${Date.now()}_${Math.random()}`
      }))
    }
  }
  
  migratedData.version = SCHEMA_VERSION
  return migratedData
}

// Validate module data
export const validateModuleData = (module) => {
  const keys = MODULE_KEYS[module] || []
  const results = {}
  
  keys.forEach(key => {
    const data = getData(key, [])
    const validator = validators[key]
    results[key] = validator ? validator(data) : true
  })
  
  return results
}

// Get storage size
export const getStorageSize = () => {
  let total = 0
  const sizes = {}
  
  Object.values(STORAGE_KEYS).forEach(key => {
    const item = localStorage.getItem(key)
    const size = item ? new Blob([item]).size : 0
    sizes[key] = size
    total += size
  })
  
  return { total, sizes, totalKB: (total / 1024).toFixed(2) }
}

// Get sync status
export const getSyncStatus = () => {
  const lastSync = localStorage.getItem('lastSync')
  const hasChanges = localStorage.getItem('hasChanges') === 'true'
  
  return {
    lastSync: lastSync ? new Date(lastSync) : null,
    hasChanges,
    status: hasChanges ? 'pending' : 'synced'
  }
}

// Mark as synced
export const markAsSynced = () => {
  localStorage.setItem('lastSync', new Date().toISOString())
  localStorage.setItem('hasChanges', 'false')
}

// Mark as changed
export const markAsChanged = () => {
  localStorage.setItem('hasChanges', 'true')
}

// Download as JSON file
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Clear all data
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export { STORAGE_KEYS, MODULE_KEYS }
