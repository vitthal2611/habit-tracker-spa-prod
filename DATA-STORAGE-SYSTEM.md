# Data Storage System

## Overview
Comprehensive localStorage-based data management with separate keys per module, validation, backup/restore, and migration utilities.

## Storage Keys

### Module Separation
```javascript
MODULE_KEYS = {
  habits: ['habits', 'habitNotes'],
  todos: ['todos', 'todoCategories'],
  expenses: ['expenses', 'transactions', 'yearlyBudgets', 'settings', 
             'savingsGoals', 'recurringTemplates', 'bills', 
             'financialGoals', 'currency'],
  budgets: ['budgets', 'yearlyBudgets']
}
```

## Core Functions

### Data Access
- `getData(key, defaultValue)` - Read with validation
- `setData(key, value)` - Write with validation
- `validateModuleData(module)` - Validate all keys in module

### Export/Import
- `exportAllData()` - Export entire database
- `exportModuleData(module)` - Export specific module
- `importData(data)` - Import with validation & migration
- `downloadJSON(data, filename)` - Download as file

### Backup/Restore
- `createBackup()` - Create timestamped backup (keeps last 5)
- `listBackups()` - List all available backups
- `restoreBackup(backupKey)` - Restore from backup
- `deleteBackup(backupKey)` - Remove backup

### Sync Status
- `getSyncStatus()` - Get sync state & last sync time
- `markAsSynced()` - Mark data as synced
- `markAsChanged()` - Mark data as changed

### Utilities
- `getStorageSize()` - Get storage usage per key
- `clearAllData()` - Clear all data (with confirmation)
- `migrateData(data)` - Migrate between schema versions

## Validation Rules

### Habits
- Must have `id` (string)
- Must have `habit` or `newHabit`

### Todos
- Must have `id` (string)
- Must have `text`

### Expenses
- Must have `id`
- Must have `amount` (number >= 0)

### Transactions
- Must have `id`
- Must have `amount` (number)
- Must have `date`

### Savings Goals
- Must have `id`
- Must have `name`
- Must have `target` (number)

## Data Manager UI

### Tabs
1. **Export** - Download all data or module-specific
2. **Import** - Upload JSON backup file
3. **Backup** - Create/restore/delete local backups
4. **Info** - Storage usage, validation, key structure

### Features
- Sync status indicator (saved/unsaved)
- Storage size breakdown
- Data validation with visual results
- Automatic backup rotation (keeps 5)
- Module-specific operations

## Usage Examples

### Export Module Data
```javascript
import { exportModuleData, downloadJSON } from './utils/dataStorage'

const data = exportModuleData('habits')
downloadJSON(data, 'habits-backup.json')
```

### Validate Data
```javascript
import { validateModuleData } from './utils/dataStorage'

const results = validateModuleData('todos')
// { todos: true, todoCategories: true }
```

### Create Backup
```javascript
import { createBackup } from './utils/dataStorage'

const result = createBackup()
if (result.success) {
  console.log('Backup created:', result.backupKey)
}
```

### Check Storage Size
```javascript
import { getStorageSize } from './utils/dataStorage'

const { total, totalKB, sizes } = getStorageSize()
console.log(`Total: ${totalKB} KB`)
```

## Migration System

### Schema Versioning
Current version: `1`

### Adding Migrations
```javascript
// In migrateData function
if (currentVersion < 2) {
  // Add migration logic for v1 -> v2
  migratedData.data.habits = migratedData.data.habits.map(h => ({
    ...h,
    newField: 'defaultValue'
  }))
}
```

## Integration

### In Components
```javascript
import { useLocalStorage } from './hooks/useLocalStorage'

const [habits, { addItem, updateItem, deleteItem }] = useLocalStorage('habits', [])
```

### Sync Status Indicator
```javascript
import SyncStatusIndicator from './components/SyncStatusIndicator'

<SyncStatusIndicator module="habits" />
```

### Data Manager Modal
```javascript
import DataManager from './components/DataManager'

<DataManager module="habits" onClose={() => setShow(false)} />
```

## Best Practices

1. **Always validate** - Use validators before saving
2. **Separate concerns** - Keep module data in separate keys
3. **Regular backups** - Encourage users to backup before major changes
4. **Migration path** - Always provide migration for schema changes
5. **Error handling** - All functions return success/error objects
6. **Type safety** - Validate data types in validators

## Error Handling

All functions return consistent error objects:
```javascript
{
  success: boolean,
  error?: string,
  results?: object
}
```

## Storage Limits

- localStorage limit: ~5-10MB per domain
- Monitor with `getStorageSize()`
- Automatic backup rotation prevents overflow
- Consider export/clear for large datasets
