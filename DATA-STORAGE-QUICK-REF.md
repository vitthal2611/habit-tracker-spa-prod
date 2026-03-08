# Data Storage Quick Reference

## 🔑 Storage Keys

```javascript
import { STORAGE_KEYS } from './utils/dataStorage'

STORAGE_KEYS.habits           // 'habits'
STORAGE_KEYS.todos            // 'todos'
STORAGE_KEYS.transactions     // 'transactions'
STORAGE_KEYS.yearlyBudgets    // 'yearlyBudgets'
// ... and more
```

## 📦 Basic Operations

```javascript
import { getData, setData } from './utils/dataStorage'

// Read
const habits = getData('habits', [])

// Write (with validation)
setData('habits', updatedHabits)
```

## 🎣 Using the Hook

```javascript
import { useLocalStorage } from './hooks/useLocalStorage'

const [data, { addItem, updateItem, deleteItem }] = useLocalStorage('habits', [])

// Add
addItem({ id: '123', habit: 'Exercise' })

// Update
updateItem({ id: '123', habit: 'Exercise Daily' })

// Delete
deleteItem('123')
```

## 💾 Export/Import

```javascript
import { exportAllData, exportModuleData, importData, downloadJSON } from './utils/dataStorage'

// Export all
const allData = exportAllData()
downloadJSON(allData, 'backup.json')

// Export module
const habitsData = exportModuleData('habits')
downloadJSON(habitsData, 'habits.json')

// Import
const result = importData(jsonData)
if (result.success) console.log('Imported!')
```

## 🔄 Backup/Restore

```javascript
import { createBackup, listBackups, restoreBackup, deleteBackup } from './utils/dataStorage'

// Create
const { success, backupKey } = createBackup()

// List
const backups = listBackups()
// [{ key: 'backup_123', date: '2024-01-01', timestamp: 123 }]

// Restore
restoreBackup('backup_123')

// Delete
deleteBackup('backup_123')
```

## 📊 Sync Status

```javascript
import { getSyncStatus, markAsSynced, markAsChanged } from './utils/dataStorage'

// Check status
const status = getSyncStatus()
// { lastSync: Date, hasChanges: boolean, status: 'synced'|'pending' }

// Mark changed
markAsChanged()

// Mark synced
markAsSynced()
```

## 🧪 Validation

```javascript
// Automatic validation on setData()
const valid = setData('habits', [
  { id: '1', habit: 'Valid' }  // ✅ Valid
])

const invalid = setData('habits', [
  { invalid: 'data' }  // ❌ Invalid - missing id and habit
])
```

## 🔧 Migration

```javascript
import { migrateData } from './utils/dataStorage'

// Automatic on import
const oldData = { version: 0, data: {...} }
const newData = migrateData(oldData)
// Returns: { version: 1, data: {...} }
```

## 🎨 UI Components

```jsx
// Data Manager Modal
import DataManager from './components/DataManager'
<DataManager module="habits" onClose={handleClose} />

// Sync Status Indicator
import SyncStatusIndicator from './components/SyncStatusIndicator'
<SyncStatusIndicator module="habits" />
```

## 🗑️ Clear Data

```javascript
import { clearAllData } from './utils/dataStorage'

const result = clearAllData()
if (result.success) console.log('Cleared!')
```

## 📋 Common Patterns

### Save with Validation
```javascript
const saveHabit = (habit) => {
  const habits = getData('habits', [])
  habits.push(habit)
  if (setData('habits', habits)) {
    markAsChanged()
    return true
  }
  return false
}
```

### Export Before Major Change
```javascript
const dangerousOperation = () => {
  createBackup() // Safety first!
  // ... do dangerous stuff
}
```

### Import with Error Handling
```javascript
const handleImport = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      const result = importData(data)
      if (result.success) {
        alert('Import successful!')
        window.location.reload()
      } else {
        alert(`Import failed: ${result.error}`)
      }
    } catch (error) {
      alert('Invalid file format')
    }
  }
  reader.readAsText(file)
}
```

## 🚨 Error Handling

All operations return success/error objects:

```javascript
const result = createBackup()
if (!result.success) {
  console.error(result.error)
  // Handle error
}
```

## 💡 Tips

1. **Always validate** before saving
2. **Create backups** before risky operations
3. **Export regularly** for external backup
4. **Check sync status** before closing app
5. **Test imports** with small datasets first
6. **Monitor localStorage quota** (~5-10MB)

## 🔗 Related Files

- `src/utils/dataStorage.js` - Core utilities
- `src/components/DataManager.jsx` - UI component
- `src/components/SyncStatusIndicator.jsx` - Status indicator
- `src/hooks/useLocalStorage.js` - React hook
- `DATA-STORAGE-GUIDE.md` - Full documentation
