// Data Storage System Tests & Examples

import {
  getData,
  setData,
  exportAllData,
  exportModuleData,
  importData,
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
  validateModuleData,
  getStorageSize,
  migrateData,
  getSyncStatus,
  markAsSynced,
  markAsChanged,
  downloadJSON,
  clearAllData,
  STORAGE_KEYS,
  MODULE_KEYS
} from './dataStorage'

// Test 1: Basic Read/Write
export const testBasicReadWrite = () => {
  console.log('Test 1: Basic Read/Write')
  
  const testHabits = [
    { id: 'h1', habit: 'Morning Exercise', newHabit: 'Run 5km' },
    { id: 'h2', habit: 'Reading', newHabit: 'Read 30 pages' }
  ]
  
  const writeResult = setData('habits', testHabits)
  console.log('Write result:', writeResult)
  
  const readData = getData('habits', [])
  console.log('Read data:', readData)
  console.log('Match:', JSON.stringify(testHabits) === JSON.stringify(readData))
}

// Test 2: Validation
export const testValidation = () => {
  console.log('\nTest 2: Validation')
  
  // Valid data
  const validHabits = [
    { id: 'h1', habit: 'Exercise' }
  ]
  console.log('Valid habits:', setData('habits', validHabits))
  
  // Invalid data (missing id)
  const invalidHabits = [
    { habit: 'Exercise' }
  ]
  console.log('Invalid habits:', setData('habits', invalidHabits))
  
  // Validate module
  const results = validateModuleData('habits')
  console.log('Validation results:', results)
}

// Test 3: Export/Import
export const testExportImport = () => {
  console.log('\nTest 3: Export/Import')
  
  // Export all
  const allData = exportAllData()
  console.log('Exported data keys:', Object.keys(allData.data))
  console.log('Export date:', allData.exportDate)
  console.log('Version:', allData.version)
  
  // Export module
  const habitsData = exportModuleData('habits')
  console.log('Habits module keys:', Object.keys(habitsData.data))
  
  // Import
  const importResult = importData(allData)
  console.log('Import result:', importResult)
}

// Test 4: Backup/Restore
export const testBackupRestore = () => {
  console.log('\nTest 4: Backup/Restore')
  
  // Create backup
  const backupResult = createBackup()
  console.log('Backup created:', backupResult)
  
  // List backups
  const backups = listBackups()
  console.log('Available backups:', backups.length)
  backups.forEach(b => {
    console.log(`  - ${b.key}: ${new Date(b.date).toLocaleString()}`)
  })
  
  // Restore (commented to prevent actual restore)
  // if (backups.length > 0) {
  //   const restoreResult = restoreBackup(backups[0].key)
  //   console.log('Restore result:', restoreResult)
  // }
}

// Test 5: Storage Size
export const testStorageSize = () => {
  console.log('\nTest 5: Storage Size')
  
  const { total, totalKB, sizes } = getStorageSize()
  console.log(`Total storage: ${totalKB} KB (${total} bytes)`)
  
  console.log('Top 5 largest keys:')
  Object.entries(sizes)
    .filter(([_, size]) => size > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5)
    .forEach(([key, size]) => {
      console.log(`  ${key}: ${(size / 1024).toFixed(2)} KB`)
    })
}

// Test 6: Sync Status
export const testSyncStatus = () => {
  console.log('\nTest 6: Sync Status')
  
  const status1 = getSyncStatus()
  console.log('Initial status:', status1)
  
  markAsChanged()
  const status2 = getSyncStatus()
  console.log('After change:', status2)
  
  markAsSynced()
  const status3 = getSyncStatus()
  console.log('After sync:', status3)
}

// Test 7: Migration
export const testMigration = () => {
  console.log('\nTest 7: Migration')
  
  const oldData = {
    version: 0,
    data: {
      habits: [
        { habit: 'Exercise' } // Missing id
      ]
    }
  }
  
  console.log('Old data:', oldData)
  const migrated = migrateData(oldData)
  console.log('Migrated data:', migrated)
  console.log('New version:', migrated.version)
}

// Test 8: Module Keys
export const testModuleKeys = () => {
  console.log('\nTest 8: Module Keys')
  
  console.log('All storage keys:', Object.values(STORAGE_KEYS))
  console.log('\nModule groupings:')
  Object.entries(MODULE_KEYS).forEach(([module, keys]) => {
    console.log(`  ${module}: ${keys.join(', ')}`)
  })
}

// Test 9: Error Handling
export const testErrorHandling = () => {
  console.log('\nTest 9: Error Handling')
  
  // Invalid import data
  const invalidImport = importData({ invalid: 'data' })
  console.log('Invalid import:', invalidImport)
  
  // Restore non-existent backup
  const invalidRestore = restoreBackup('backup_nonexistent')
  console.log('Invalid restore:', invalidRestore)
  
  // Delete non-existent backup
  const invalidDelete = deleteBackup('backup_nonexistent')
  console.log('Invalid delete:', invalidDelete)
}

// Test 10: Full Workflow
export const testFullWorkflow = () => {
  console.log('\nTest 10: Full Workflow')
  
  // 1. Add data
  const habits = [
    { id: 'h1', habit: 'Exercise', newHabit: 'Run' },
    { id: 'h2', habit: 'Read', newHabit: 'Read books' }
  ]
  setData('habits', habits)
  console.log('1. Data added')
  
  // 2. Validate
  const validation = validateModuleData('habits')
  console.log('2. Validation:', validation)
  
  // 3. Create backup
  const backup = createBackup()
  console.log('3. Backup created:', backup.success)
  
  // 4. Export
  const exported = exportModuleData('habits')
  console.log('4. Exported:', Object.keys(exported.data))
  
  // 5. Check storage
  const storage = getStorageSize()
  console.log('5. Storage:', storage.totalKB, 'KB')
  
  // 6. Check sync status
  const sync = getSyncStatus()
  console.log('6. Sync status:', sync.status)
}

// Run all tests
export const runAllTests = () => {
  console.log('=== Data Storage System Tests ===\n')
  
  try {
    testBasicReadWrite()
    testValidation()
    testExportImport()
    testBackupRestore()
    testStorageSize()
    testSyncStatus()
    testMigration()
    testModuleKeys()
    testErrorHandling()
    testFullWorkflow()
    
    console.log('\n=== All Tests Complete ===')
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Example: Download backup
export const exampleDownloadBackup = () => {
  const data = exportAllData()
  downloadJSON(data, `backup-${new Date().toISOString().split('T')[0]}.json`)
}

// Example: Clear specific module
export const exampleClearModule = (module) => {
  const keys = MODULE_KEYS[module] || []
  keys.forEach(key => {
    setData(key, [])
  })
  console.log(`Cleared ${module} module`)
}

// To run tests in browser console:
// import { runAllTests } from './utils/dataStorageTests'
// runAllTests()
