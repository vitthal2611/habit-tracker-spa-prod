import { useState } from 'react'
import { Download, Upload, Database, Clock, CheckCircle, AlertCircle, Trash2, Save, HardDrive, Shield } from 'lucide-react'
import Modal from './ui/Modal'
import { 
  exportAllData, 
  exportModuleData, 
  importData, 
  createBackup, 
  listBackups, 
  restoreBackup, 
  deleteBackup,
  getSyncStatus,
  downloadJSON,
  clearAllData,
  validateModuleData,
  getStorageSize,
  MODULE_KEYS
} from '../utils/dataStorage'

export default function DataManager({ module = 'all', onClose }) {
  const [activeTab, setActiveTab] = useState('export')
  const [backups, setBackups] = useState(listBackups())
  const [syncStatus, setSyncStatus] = useState(getSyncStatus())
  const [storageSize, setStorageSize] = useState(getStorageSize())
  const [validationResults, setValidationResults] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleExportAll = () => {
    const data = exportAllData()
    downloadJSON(data, `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`)
    showToast('Data exported successfully!')
  }

  const handleExportModule = () => {
    const data = exportModuleData(module)
    downloadJSON(data, `${module}-backup-${new Date().toISOString().split('T')[0]}.json`)
    showToast(`${module} data exported!`)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        const result = importData(data)
        if (result.success) {
          showToast('Data imported successfully!')
          setTimeout(() => window.location.reload(), 1500)
        } else {
          showToast(result.error, 'error')
        }
      } catch (error) {
        showToast('Invalid file format', 'error')
      }
    }
    reader.readAsText(file)
  }

  const handleCreateBackup = () => {
    const result = createBackup()
    if (result.success) {
      setBackups(listBackups())
      showToast('Backup created!')
    } else {
      showToast(result.error, 'error')
    }
  }

  const handleRestoreBackup = (backupKey) => {
    if (!confirm('Restore this backup? Current data will be replaced.')) return
    
    const result = restoreBackup(backupKey)
    if (result.success) {
      showToast('Backup restored!')
      setTimeout(() => window.location.reload(), 1500)
    } else {
      showToast(result.error, 'error')
    }
  }

  const handleDeleteBackup = (backupKey) => {
    if (!confirm('Delete this backup?')) return
    
    const result = deleteBackup(backupKey)
    if (result.success) {
      setBackups(listBackups())
      showToast('Backup deleted!')
    } else {
      showToast(result.error, 'error')
    }
  }

  const handleValidateData = () => {
    if (module === 'all') {
      const results = {}
      Object.keys(MODULE_KEYS).forEach(mod => {
        results[mod] = validateModuleData(mod)
      })
      setValidationResults(results)
    } else {
      setValidationResults({ [module]: validateModuleData(module) })
    }
    showToast('Validation complete!')
  }

  const handleClearAll = () => {
    if (!confirm('Clear all data? This cannot be undone!')) return
    if (!confirm('Are you absolutely sure? All data will be lost!')) return
    
    const result = clearAllData()
    if (result.success) {
      showToast('All data cleared!')
      setTimeout(() => window.location.reload(), 1500)
    } else {
      showToast(result.error, 'error')
    }
  }

  return (
    <Modal onClose={onClose} title="Data Management">
      <div className="space-y-4">
        {/* Sync Status */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {syncStatus.status === 'synced' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {syncStatus.status === 'synced' ? 'All changes saved' : 'Unsaved changes'}
              </p>
              {syncStatus.lastSync && (
                <p className="text-xs text-gray-500">
                  Last saved: {new Date(syncStatus.lastSync).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 font-semibold whitespace-nowrap ${
              activeTab === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 font-semibold whitespace-nowrap ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Import
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 font-semibold whitespace-nowrap ${
              activeTab === 'backup'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Backups
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-semibold whitespace-nowrap ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Info
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-3">
            <button
              onClick={handleExportAll}
              className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
            >
              <Download className="w-5 h-5" />
              Export All Data
            </button>
            {module !== 'all' && (
              <button
                onClick={handleExportModule}
                className="w-full p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold"
              >
                <Download className="w-5 h-5" />
                Export {module.charAt(0).toUpperCase() + module.slice(1)} Only
              </button>
            )}
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-3">
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <div className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold cursor-pointer">
                <Upload className="w-5 h-5" />
                Import Data from File
              </div>
            </label>
            <p className="text-xs text-gray-500 text-center">
              Select a JSON backup file to restore your data
            </p>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-3">
            <button
              onClick={handleCreateBackup}
              className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-semibold"
            >
              <Save className="w-5 h-5" />
              Create Backup
            </button>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {backups.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No backups yet</p>
              ) : (
                backups.map((backup) => (
                  <div
                    key={backup.key}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {new Date(backup.date).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {backup.key}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestoreBackup(backup.key)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Restore"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.key)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Storage Size */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Storage Usage</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">{storageSize.totalKB} KB</p>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {Object.entries(storageSize.sizes)
                  .filter(([_, size]) => size > 0)
                  .sort(([_, a], [__, b]) => b - a)
                  .slice(0, 5)
                  .map(([key, size]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span>{(size / 1024).toFixed(2)} KB</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Validation */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Data Validation</h3>
              </div>
              <button
                onClick={handleValidateData}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mb-3"
              >
                Validate Data
              </button>
              {validationResults && (
                <div className="space-y-2">
                  {Object.entries(validationResults).map(([mod, results]) => (
                    <div key={mod} className="text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white capitalize mb-1">{mod}:</p>
                      <div className="pl-3 space-y-1">
                        {Object.entries(results).map(([key, valid]) => (
                          <div key={key} className="flex items-center gap-2">
                            {valid ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span className={valid ? 'text-green-600' : 'text-red-600'}>
                              {key}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Module Keys Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Storage Keys</h3>
              <div className="space-y-2 text-xs">
                {Object.entries(MODULE_KEYS).map(([mod, keys]) => (
                  <div key={mod}>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{mod}:</p>
                    <p className="text-gray-500 pl-3">{keys.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClearAll}
            className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-semibold"
          >
            <Trash2 className="w-5 h-5" />
            Clear All Data
          </button>
          <p className="text-xs text-red-500 text-center mt-2">
            Warning: This action cannot be undone
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white font-semibold`}
        >
          {toast.message}
        </div>
      )}
    </Modal>
  )
}
