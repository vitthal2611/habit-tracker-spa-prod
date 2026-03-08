# Data Storage Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Navigation Bar                                              │
│  ├── Module Tabs (Habits, Todos, Expenses)                  │
│  ├── SyncStatusIndicator ◄─── Shows sync state              │
│  └── Dark Mode Toggle                                        │
├─────────────────────────────────────────────────────────────┤
│  DataManager Modal (Click sync indicator)                   │
│  ├── Export Tab                                              │
│  │   ├── Export All Data                                     │
│  │   └── Export Module Data                                  │
│  ├── Import Tab                                              │
│  │   └── Upload JSON File                                    │
│  ├── Backup Tab                                              │
│  │   ├── Create Backup                                       │
│  │   ├── List Backups (max 5)                               │
│  │   ├── Restore Backup                                      │
│  │   └── Delete Backup                                       │
│  └── Info Tab                                                │
│      ├── Storage Usage (KB)                                  │
│      ├── Data Validation                                     │
│      └── Module Keys Reference                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                        │
├─────────────────────────────────────────────────────────────┤
│  dataStorage.js - Core utilities                            │
│  ├── getData(key, default)                                  │
│  ├── setData(key, value)                                    │
│  ├── exportAllData()                                        │
│  ├── exportModuleData(module)                               │
│  ├── importData(data)                                       │
│  ├── createBackup()                                         │
│  ├── restoreBackup(key)                                     │
│  ├── validateModuleData(module)                             │
│  ├── getStorageSize()                                       │
│  ├── migrateData(data)                                      │
│  └── getSyncStatus()                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Validation Layer                           │
├─────────────────────────────────────────────────────────────┤
│  validators = {                                              │
│    habits: (data) => validate habits structure              │
│    todos: (data) => validate todos structure                │
│    expenses: (data) => validate expenses structure          │
│    transactions: (data) => validate transactions            │
│    savingsGoals: (data) => validate goals                   │
│    ...                                                       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  localStorage (Browser)                      │
├─────────────────────────────────────────────────────────────┤
│  Module: Habits                                              │
│  ├── habits: [...]                                           │
│  └── habitNotes: [...]                                       │
│                                                              │
│  Module: Todos                                               │
│  ├── todos: [...]                                            │
│  └── todoCategories: [...]                                   │
│                                                              │
│  Module: Expenses                                            │
│  ├── expenses: [...]                                         │
│  ├── transactions: [...]                                     │
│  ├── yearlyBudgets: [...]                                    │
│  ├── settings: [...]                                         │
│  ├── savingsGoals: [...]                                     │
│  ├── recurringTemplates: [...]                              │
│  ├── bills: [...]                                            │
│  ├── financialGoals: [...]                                   │
│  └── currency: [...]                                         │
│                                                              │
│  Module: Budgets                                             │
│  ├── budgets: [...]                                          │
│  └── yearlyBudgets: [...]                                    │
│                                                              │
│  System Keys                                                 │
│  ├── lastSync: "2024-01-15T10:30:00Z"                       │
│  ├── hasChanges: "false"                                     │
│  ├── backup_1705315800000: {...}                            │
│  ├── backup_1705315900000: {...}                            │
│  └── ... (max 5 backups)                                     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Write Operation
```
Component
   │
   ├─► useLocalStorage hook
   │      │
   │      ├─► setData(key, value)
   │      │      │
   │      │      ├─► Validate with validators[key]
   │      │      │      │
   │      │      │      ├─► ✓ Valid → localStorage.setItem()
   │      │      │      │                    │
   │      │      │      │                    └─► markAsChanged()
   │      │      │      │
   │      │      │      └─► ✗ Invalid → Return false
   │      │      │
   │      │      └─► Return success/failure
   │      │
   │      └─► Update component state
   │
   └─► UI updates
```

### Export Operation
```
User clicks "Export All"
   │
   ├─► exportAllData()
   │      │
   │      ├─► Loop through STORAGE_KEYS
   │      │      │
   │      │      └─► getData(key) for each key
   │      │
   │      ├─► Build export object:
   │      │   {
   │      │     version: 1,
   │      │     exportDate: "2024-01-15...",
   │      │     data: { habits: [...], todos: [...], ... }
   │      │   }
   │      │
   │      └─► Return export object
   │
   ├─► downloadJSON(data, filename)
   │      │
   │      ├─► Create Blob from JSON
   │      ├─► Create download link
   │      └─► Trigger download
   │
   └─► Show success toast
```

### Import Operation
```
User uploads JSON file
   │
   ├─► FileReader reads file
   │      │
   │      └─► Parse JSON
   │
   ├─► importData(data)
   │      │
   │      ├─► Validate format (version, data)
   │      │      │
   │      │      └─► ✗ Invalid → Return error
   │      │
   │      ├─► migrateData(data)
   │      │      │
   │      │      ├─► Check version
   │      │      ├─► Apply migrations if needed
   │      │      └─► Return migrated data
   │      │
   │      ├─► Loop through data keys
   │      │      │
   │      │      └─► setData(key, value) for each
   │      │             │
   │      │             └─► Validates each key
   │      │
   │      └─► Return success/failure
   │
   ├─► Show success toast
   │
   └─► Reload page
```

### Backup Operation
```
User clicks "Create Backup"
   │
   ├─► createBackup()
   │      │
   │      ├─► exportAllData()
   │      │      │
   │      │      └─► Get all data
   │      │
   │      ├─► Generate backup key: backup_[timestamp]
   │      │
   │      ├─► Save to localStorage
   │      │
   │      ├─► listBackups()
   │      │      │
   │      │      └─► Get all backup_* keys
   │      │
   │      ├─► If > 5 backups
   │      │      │
   │      │      └─► Delete oldest backups
   │      │
   │      └─► Return success
   │
   └─► Refresh backup list in UI
```

### Validation Operation
```
User clicks "Validate Data"
   │
   ├─► validateModuleData(module)
   │      │
   │      ├─► Get MODULE_KEYS[module]
   │      │      │
   │      │      └─► ['habits', 'habitNotes']
   │      │
   │      ├─► For each key:
   │      │      │
   │      │      ├─► getData(key)
   │      │      │
   │      │      ├─► validators[key](data)
   │      │      │      │
   │      │      │      ├─► Check array
   │      │      │      ├─► Check required fields
   │      │      │      ├─► Check data types
   │      │      │      └─► Return true/false
   │      │      │
   │      │      └─► Store result
   │      │
   │      └─► Return { habits: true, habitNotes: true }
   │
   └─► Display results with ✓/✗ icons
```

## Module Structure

```
MODULE_KEYS = {
  habits: [
    'habits'        ← Main habit data
    'habitNotes'    ← Notes for habits
  ],
  
  todos: [
    'todos'         ← Todo items
    'todoCategories'← Categories
  ],
  
  expenses: [
    'expenses'      ← Expense entries
    'transactions'  ← Financial transactions
    'yearlyBudgets' ← Budget data
    'settings'      ← Expense settings
    'savingsGoals'  ← Savings targets
    'recurringTemplates' ← Recurring expenses
    'bills'         ← Bill tracking
    'financialGoals'← Financial goals
    'currency'      ← Currency settings
  ],
  
  budgets: [
    'budgets'       ← Budget categories
    'yearlyBudgets' ← Yearly budget data
  ]
}
```

## Sync Status Flow

```
Component modifies data
   │
   ├─► useLocalStorage hook
   │      │
   │      └─► setData(key, value)
   │             │
   │             └─► markAsChanged()
   │                    │
   │                    └─► localStorage.setItem('hasChanges', 'true')
   │
   └─► SyncStatusIndicator (polls every 5s)
          │
          ├─► getSyncStatus()
          │      │
          │      ├─► Read 'hasChanges'
          │      ├─► Read 'lastSync'
          │      └─► Return { status: 'pending', lastSync: ... }
          │
          └─► Display ⚠ (unsaved) or ✓ (synced)
```

## Error Handling Pattern

```
All functions return:
{
  success: boolean,
  error?: string,
  results?: object,
  backupKey?: string
}

Example:
  const result = createBackup()
  if (result.success) {
    console.log('Backup created:', result.backupKey)
  } else {
    console.error('Backup failed:', result.error)
  }
```

## Storage Limits

```
localStorage Capacity: ~5-10 MB per domain

Monitor with getStorageSize():
{
  total: 1234567,           // bytes
  totalKB: "1205.63",       // KB string
  sizes: {
    habits: 5000,
    todos: 3000,
    expenses: 50000,
    ...
  }
}

Mitigation strategies:
1. Export old data
2. Clear unused modules
3. Delete old backups
4. Compress data (future)
```
