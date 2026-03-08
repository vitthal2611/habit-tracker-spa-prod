# Data Migration Guide

## Overview
This guide explains how to add new schema migrations when data structure changes are needed.

## Current Schema Version
**Version: 1**

## Migration History

### Version 0 → Version 1
**Changes:**
- Added automatic ID generation for habits missing IDs
- Ensured all habits have required `id` field

**Implementation:**
```javascript
if (currentVersion < 1) {
  if (migratedData.data?.habits) {
    migratedData.data.habits = migratedData.data.habits.map(h => ({
      ...h,
      id: h.id || `habit_${Date.now()}_${Math.random()}`
    }))
  }
}
```

## Adding New Migrations

### Step 1: Update Schema Version
In `src/utils/dataStorage.js`:
```javascript
const SCHEMA_VERSION = 2  // Increment version
```

### Step 2: Add Migration Logic
In the `migrateData` function:
```javascript
export const migrateData = (data) => {
  const currentVersion = data.version || 0
  let migratedData = { ...data }
  
  // Existing migrations
  if (currentVersion < 1) {
    // v0 → v1 migration
  }
  
  // NEW: Add your migration here
  if (currentVersion < 2) {
    // v1 → v2 migration
    // Example: Add new field to todos
    if (migratedData.data?.todos) {
      migratedData.data.todos = migratedData.data.todos.map(todo => ({
        ...todo,
        priority: todo.priority || 'medium',  // Add default priority
        createdAt: todo.createdAt || new Date().toISOString()
      }))
    }
  }
  
  migratedData.version = SCHEMA_VERSION
  return migratedData
}
```

### Step 3: Update Validators
Add validation for new fields:
```javascript
const validators = {
  todos: (data) => Array.isArray(data) && data.every(t => 
    t.id && 
    typeof t.id === 'string' && 
    t.text &&
    t.priority &&  // NEW: Validate priority
    ['low', 'medium', 'high'].includes(t.priority)  // NEW: Validate values
  ),
  // ... other validators
}
```

### Step 4: Test Migration
Create test in `dataStorageTests.js`:
```javascript
export const testMigrationV2 = () => {
  console.log('Test: Migration v1 → v2')
  
  const v1Data = {
    version: 1,
    data: {
      todos: [
        { id: 't1', text: 'Test todo' }  // Missing priority
      ]
    }
  }
  
  const migrated = migrateData(v1Data)
  
  console.log('Migrated version:', migrated.version)  // Should be 2
  console.log('Has priority:', migrated.data.todos[0].priority)  // Should be 'medium'
  console.log('Has createdAt:', !!migrated.data.todos[0].createdAt)  // Should be true
}
```

### Step 5: Document Changes
Update this file with:
- Version number
- Date of change
- What changed
- Why it changed
- Migration code

## Migration Best Practices

### 1. Always Provide Defaults
```javascript
// ✅ Good: Provides default value
newField: item.newField || 'defaultValue'

// ❌ Bad: Leaves undefined
newField: item.newField
```

### 2. Preserve Existing Data
```javascript
// ✅ Good: Spreads existing data
{ ...item, newField: 'value' }

// ❌ Bad: Replaces entire object
{ id: item.id, newField: 'value' }
```

### 3. Handle Missing Data
```javascript
// ✅ Good: Checks if data exists
if (migratedData.data?.todos) {
  // migrate todos
}

// ❌ Bad: Assumes data exists
migratedData.data.todos = migratedData.data.todos.map(...)
```

### 4. Validate After Migration
```javascript
// ✅ Good: Validates migrated data
const migrated = migrateData(data)
const valid = validators.todos(migrated.data.todos)
if (!valid) {
  console.error('Migration produced invalid data')
}
```

### 5. Test with Real Data
```javascript
// Export current data
const currentData = exportAllData()

// Test migration
const migrated = migrateData(currentData)

// Verify all data is intact
console.log('Data preserved:', 
  migrated.data.todos.length === currentData.data.todos.length
)
```

## Common Migration Scenarios

### Adding a New Field
```javascript
if (currentVersion < 2) {
  if (migratedData.data?.habits) {
    migratedData.data.habits = migratedData.data.habits.map(h => ({
      ...h,
      streak: h.streak || 0,  // Add streak counter
      lastCompleted: h.lastCompleted || null
    }))
  }
}
```

### Renaming a Field
```javascript
if (currentVersion < 2) {
  if (migratedData.data?.expenses) {
    migratedData.data.expenses = migratedData.data.expenses.map(e => ({
      ...e,
      category: e.type,  // Rename 'type' to 'category'
      type: undefined    // Remove old field
    }))
  }
}
```

### Changing Data Type
```javascript
if (currentVersion < 2) {
  if (migratedData.data?.todos) {
    migratedData.data.todos = migratedData.data.todos.map(t => ({
      ...t,
      // Convert string date to Date object
      dueDate: t.dueDate ? new Date(t.dueDate) : null
    }))
  }
}
```

### Restructuring Data
```javascript
if (currentVersion < 2) {
  if (migratedData.data?.habits) {
    migratedData.data.habits = migratedData.data.habits.map(h => ({
      ...h,
      // Restructure nested object
      settings: {
        location: h.location || '',
        time: h.time || '',
        duration: h.duration || ''
      },
      // Remove old flat fields
      location: undefined,
      time: undefined,
      duration: undefined
    }))
  }
}
```

### Adding New Storage Key
```javascript
// 1. Add to STORAGE_KEYS
const STORAGE_KEYS = {
  // ... existing keys
  habitStats: 'habitStats'  // NEW
}

// 2. Add to MODULE_KEYS
const MODULE_KEYS = {
  habits: ['habits', 'habitNotes', 'habitStats'],  // Add new key
  // ... other modules
}

// 3. Add validator
const validators = {
  habitStats: (data) => Array.isArray(data) && data.every(s => 
    s.habitId && s.completions
  ),
  // ... other validators
}

// 4. Initialize in migration
if (currentVersion < 2) {
  // Create habitStats from existing habits
  if (migratedData.data?.habits) {
    migratedData.data.habitStats = migratedData.data.habits.map(h => ({
      habitId: h.id,
      completions: [],
      streak: 0
    }))
  }
}
```

## Testing Migrations

### Manual Testing
1. Export current data
2. Modify schema version in export file
3. Import modified file
4. Verify data migrated correctly
5. Check all features still work

### Automated Testing
```javascript
export const testMigrationChain = () => {
  // Test v0 → v1 → v2
  const v0Data = { version: 0, data: { habits: [...] } }
  
  const v1Data = migrateData(v0Data)
  console.assert(v1Data.version === 1, 'Should be v1')
  
  const v2Data = migrateData(v1Data)
  console.assert(v2Data.version === 2, 'Should be v2')
  
  // Verify data integrity
  console.assert(
    v2Data.data.habits.length === v0Data.data.habits.length,
    'Should preserve all habits'
  )
}
```

## Rollback Strategy

### If Migration Fails
1. User can restore from backup
2. User can re-import old export file
3. System falls back to default values

### Preventing Data Loss
```javascript
// Always create backup before import
const handleImport = (data) => {
  // 1. Create backup first
  const backup = createBackup()
  
  // 2. Try migration
  const result = importData(data)
  
  // 3. If failed, restore backup
  if (!result.success) {
    restoreBackup(backup.backupKey)
    showError('Migration failed, restored from backup')
  }
}
```

## Version Compatibility

### Forward Compatibility
- Newer versions can read older data (via migration)
- Old data automatically upgraded on import

### Backward Compatibility
- Older versions cannot read newer data
- Export includes version number for checking

### Version Check
```javascript
const checkCompatibility = (importedData) => {
  const currentVersion = SCHEMA_VERSION
  const importVersion = importedData.version || 0
  
  if (importVersion > currentVersion) {
    return {
      compatible: false,
      message: 'This data is from a newer version. Please update the app.'
    }
  }
  
  return { compatible: true }
}
```

## Migration Checklist

When adding a new migration:
- [ ] Increment SCHEMA_VERSION
- [ ] Add migration logic in migrateData()
- [ ] Update validators if needed
- [ ] Add new keys to STORAGE_KEYS if needed
- [ ] Update MODULE_KEYS if needed
- [ ] Write migration test
- [ ] Test with real data
- [ ] Document changes in this file
- [ ] Update DATA-STORAGE-SYSTEM.md
- [ ] Create backup before deploying

## Future Considerations

### Large Migrations
For migrations that process lots of data:
```javascript
// Show progress indicator
const migrateLargeDataset = (data) => {
  const total = data.length
  return data.map((item, index) => {
    if (index % 100 === 0) {
      console.log(`Migrating: ${index}/${total}`)
    }
    return migrateItem(item)
  })
}
```

### Async Migrations
For migrations that need async operations:
```javascript
export const migrateDataAsync = async (data) => {
  // ... sync migrations
  
  if (currentVersion < 3) {
    // Async migration example
    migratedData.data.habits = await Promise.all(
      migratedData.data.habits.map(async (h) => ({
        ...h,
        enrichedData: await fetchEnrichmentData(h.id)
      }))
    )
  }
  
  return migratedData
}
```

## Support

For migration issues:
1. Check console for error messages
2. Verify data format in export file
3. Test migration with sample data
4. Restore from backup if needed
5. Contact support with error details
