import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    } catch {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('darkMode', isDark)
    } catch {
      console.warn('Failed to save dark mode preference')
    }
  }, [isDark])

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Habit Tracker</h1>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}