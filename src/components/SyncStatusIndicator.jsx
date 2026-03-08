import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Database } from 'lucide-react'
import { getSyncStatus } from '../utils/dataStorage'
import DataManager from './DataManager'

export default function SyncStatusIndicator({ module = 'all' }) {
  const [syncStatus, setSyncStatus] = useState(getSyncStatus())
  const [showDataManager, setShowDataManager] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <button
        onClick={() => setShowDataManager(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={syncStatus.status === 'synced' ? 'All changes saved' : 'Unsaved changes'}
      >
        <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {syncStatus.status === 'synced' ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        )}
      </button>

      {showDataManager && (
        <DataManager module={module} onClose={() => setShowDataManager(false)} />
      )}
    </>
  )
}
