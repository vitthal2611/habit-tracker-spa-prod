import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navigation({ onLogout }) {
  const [isDark, setIsDark] = useState(() => 
    localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', isDark)
  }, [isDark])

  return (
    <nav className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Habit Tracker</h1>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors min-h-[44px]"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}