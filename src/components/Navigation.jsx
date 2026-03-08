import { Moon, Sun, Target, CheckSquare, DollarSign, Command } from 'lucide-react'
import { useState, useEffect } from 'react'
import SyncStatusIndicator from './SyncStatusIndicator'
import Tooltip from './ui/Tooltip'

export default function Navigation({ activeTab, onTabChange, isDark, setIsDark, onShowShortcuts }) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('darkMode', isDark)
    } catch {
      console.warn('Failed to save dark mode preference')
    }
  }, [isDark])

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Life Tracker</h1>
          
          <div className="flex items-center gap-2">
            <SyncStatusIndicator module={activeTab} />
            <Tooltip text="Keyboard shortcuts (Ctrl+/)">
              <button
                onClick={onShowShortcuts}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                aria-label="Show keyboard shortcuts"
              >
                <Command className="w-5 h-5" />
              </button>
            </Tooltip>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1" role="tablist">
              <button
                onClick={() => onTabChange('habits')}
                role="tab"
                aria-selected={activeTab === 'habits'}
                aria-label="Habits module"
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 ${
                  activeTab === 'habits'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Habits</span>
              </button>
              <button
                onClick={() => onTabChange('todos')}
                role="tab"
                aria-selected={activeTab === 'todos'}
                aria-label="To-Do module"
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 ${
                  activeTab === 'todos'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">To-Do</span>
              </button>
              <button
                onClick={() => onTabChange('expenses')}
                role="tab"
                aria-selected={activeTab === 'expenses'}
                aria-label="Expenses module"
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 ${
                  activeTab === 'expenses'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Expenses</span>
              </button>
            </div>
            <Tooltip text={isDark ? 'Light mode (Ctrl+D)' : 'Dark mode (Ctrl+D)'}>
              <button
                onClick={() => setIsDark(!isDark)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </nav>
  )
}