# Data Storage System

## Overview

The application uses a robust localStorage-based data storage system with separate keys for each module, validation, backup/restore, and migration capabilities.

## Storage Keys

Each module has dedicated localStorage keys:

- **Habits Module**: `habits`, `habitNotes`
- **Todos Module**: `todos`, `todoCategories`
- **Expenses Module**: `transactions`, `yearlyBudgets`, `settings`, `savingsGoals`, `recurringTemplates`, `bills`, `financialGoals`, `currency`

## Features

### 1. Data Validation

All data is validated before being saved to localStorage:
- Habits: Must have `id` and either `habit` or `newHabit`
- Todos: Must have `id`
- Transactions: Must have `id` and `amount`
- Arrays are validated for structure

### 2. Export/Import

**Export All Data:**
```javascript
import { exportAllData, downloadJSON } from './utils/dataStorage'

const data = exportAllData()
downloadJSON(data, 'backup.json')
```

**Export Module Data:**
```javascript
import { exportModuleData, downloadJSON } from './utils/dataStorage'

const data = exportModuleData('habits')
downloadJSON(data, 'habits-backup.json')
```

**Import Data:**
```javascript
import { importData } from './utils/dataStorage'

const result = importData(jsonData)
if (result.success) {
  console.log('Import successful')
}
```

### 3. Backup & Restore

**Create Backup:**
```javascript
import { createBackup } from './utils/dataStorage'

const result = createBackup()
// Automatically keeps last 5 backups
```

**List Backups:**
```javascript
import { listBackups } from './utils/dataStorage'

const backups = listBackups()
// Returns array of backup objects with key, date, timestamp
```

**Restore Backup:**
```javascript
import { restoreBackup } from './utils/dataStorage'

const result = restoreBackup('backup_1234567890')
```

### 4. Sync Status

Track data changes and sync status:

```javascript
import { getSyncStatus, markAsSynced, markAsChanged } from './utils/dataStorage'

const status = getSyncStatus()
// Returns: { lastSync: Date, hasChanges: boolean, status: 'synced'|'pending' }
```

### 5. Data Migration

Automatic schema migration when importing older data:

```javascript
import { migrateData } from './utils/dataStorage'

const migratedData = migrateData(oldData)
// Automatically upgrades to current schema version
```

## Components

### DataManager Component

Full-featured UI for data management:

```jsx
import DataManager from './components/DataManager'

<DataManager module="habits" onClose={() => setShow(false)} />
```

Features:
- Export all data or module-specific data
- Import from JSON file
- Create and manage backups
- Restore from backup
- Clear all data (with confirmation)
- Sync status indicator

### SyncStatusIndicator Component

Shows real-time sync status in navigation:

```jsx
import SyncStatusIndicator from './components/SyncStatusIndicator'

<SyncStatusIndicator module="habits" />
```

Displays:
- Green checkmark: All changes saved
- Yellow alert: Unsaved changes
- Last sync timestamp
- Click to open DataManager

## Usage in Modules

The `useLocalStorage` hook automatically integrates with the storage system:

```jsx
import { useLocalStorage } from './hooks/useLocalStorage'

const [habits, { addItem, updateItem, deleteItem }] = useLocalStorage('habits', [])
```

Features:
- Automatic validation
- Change tracking
- Error handling
- Consistent API

## Data Format

### Export Format

```json
{
  "version": 1,
  "exportDate": "2024-01-01T00:00:00.000Z",
  "data": {
    "habits": [...],
    "todos": [...],
    "transactions": [...]
  }
}
```

### Backup Format

Same as export format, stored in localStorage with key `backup_<timestamp>`

## Best Practices

1. **Always validate data** before saving
2. **Create backups** before major changes
3. **Export data regularly** for external backup
4. **Test imports** with small datasets first
5. **Monitor sync status** for unsaved changes

## Error Handling

All storage operations return success/error objects:

```javascript
const result = importData(data)
if (!result.success) {
  console.error(result.error)
}
```

## Storage Limits

- localStorage limit: ~5-10MB per domain
- Automatic backup limit: 5 most recent backups
- Consider exporting to file for long-term storage

## Migration Guide

When updating schema:

1. Increment `SCHEMA_VERSION` in `dataStorage.js`
2. Add migration logic in `migrateData()` function
3. Test with old data format
4. Document changes in migration notes

Example:
```javascript
if (currentVersion < 2) {
  // Migrate from v1 to v2
  data.data.habits = data.data.habits.map(h => ({
    ...h,
    newField: 'defaultValue'
  }))
}
```

## Security Notes

- Data stored in localStorage is not encrypted
- Sensitive data should not be stored
- Export files contain plain JSON
- Consider user privacy when sharing exports

## Troubleshooting

**Import fails:**
- Check JSON format
- Verify schema version
- Check browser console for errors

**Backup not created:**
- Check localStorage quota
- Clear old backups manually
- Export to file instead

**Data not syncing:**
- Check browser console
- Verify localStorage is enabled
- Check for quota exceeded errors
