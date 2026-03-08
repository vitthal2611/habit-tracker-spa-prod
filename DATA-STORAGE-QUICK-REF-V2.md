# Data Storage Quick Reference

## Import
```javascript
import { 
  getData, setData,
  exportAllData, exportModuleData, importData,
  createBackup, restoreBackup, listBackups,
  validateModuleData, getStorageSize,
  STORAGE_KEYS, MODULE_KEYS
} from './utils/dataStorage'
```

## Common Operations

### Read/Write
```javascript
// Read
const habits = getData('habits', [])

// Write
setData('habits', updatedHabits)
```

### Export
```javascript
// All data
const allData = exportAllData()
downloadJSON(allData, 'full-backup.json')

// Module only
const habitsData = exportModuleData('habits')
downloadJSON(habitsData, 'habits-backup.json')
```

### Import
```javascript
const result = importData(jsonData)
if (result.success) {
  window.location.reload()
}
```

### Backup
```javascript
// Create
createBackup()

// List
const backups = listBackups()

// Restore
restoreBackup('backup_1234567890')
```

### Validation
```javascript
// Validate module
const results = validateModuleData('habits')
// { habits: true, habitNotes: true }

// Check storage
const { totalKB, sizes } = getStorageSize()
```

## Module Keys

| Module | Keys |
|--------|------|
| habits | habits, habitNotes |
| todos | todos, todoCategories |
| expenses | expenses, transactions, yearlyBudgets, settings, savingsGoals, recurringTemplates, bills, financialGoals, currency |
| budgets | budgets, yearlyBudgets |

## UI Components

### Sync Indicator
```jsx
<SyncStatusIndicator module="habits" />
```

### Data Manager
```jsx
<DataManager module="habits" onClose={() => {}} />
```

## Hook Usage
```javascript
const [data, { addItem, updateItem, deleteItem }] = useLocalStorage('habits', [])
```

## Validation Rules

- **habits**: id (string), habit or newHabit
- **todos**: id (string), text
- **expenses**: id, amount (number >= 0)
- **transactions**: id, amount (number), date
- **savingsGoals**: id, name, target (number)

## Error Handling
```javascript
const result = someOperation()
if (!result.success) {
  console.error(result.error)
}
```
