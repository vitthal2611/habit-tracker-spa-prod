import { useState, useEffect } from 'react'
import { Command, X } from 'lucide-react'

const shortcuts = {
  global: [
    { keys: ['Ctrl', 'K'], description: 'Open command palette', mac: ['⌘', 'K'] },
    { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts', mac: ['⌘', '/'] },
    { keys: ['Ctrl', '1'], description: 'Go to Habits', mac: ['⌘', '1'] },
    { keys: ['Ctrl', '2'], description: 'Go to To-Do', mac: ['⌘', '2'] },
    { keys: ['Ctrl', '3'], description: 'Go to Expenses', mac: ['⌘', '3'] },
    { keys: ['Ctrl', 'D'], description: 'Toggle dark mode', mac: ['⌘', 'D'] }
  ],
  habits: [
    { keys: ['N'], description: 'New habit' },
    { keys: ['S'], description: 'Select mode' },
    { keys: ['T'], description: 'Templates' },
    { keys: ['A'], description: 'Analytics' }
  ],
  todos: [
    { keys: ['N'], description: 'New task' },
    { keys: ['T'], description: 'Templates' }
  ],
  expenses: [
    { keys: ['N'], description: 'New transaction' },
    { keys: ['B'], description: 'Budget view' }
  ]
}

export default function KeyboardShortcuts({ module, onClose }) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Command className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Global</h3>
              <div className="space-y-2">
                {shortcuts.global.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {(isMac && shortcut.mac ? shortcut.mac : shortcut.keys).map((key, i) => (
                        <kbd key={i} className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {module && shortcuts[module] && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{module.charAt(0).toUpperCase() + module.slice(1)}</h3>
                <div className="space-y-2">
                  {shortcuts[module].map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd key={i} className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
