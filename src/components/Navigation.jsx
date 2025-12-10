import { Moon, Sun, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { auth } from '../firebase'

export default function Navigation({ onLogout }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    } catch {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })

  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('darkMode', isDark)
    } catch {
      console.warn('Failed to save dark mode preference')
    }
  }, [isDark])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
  }

  return (
    <nav className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wide">
              Habit Tracker
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* User Menu */}
            {auth.currentUser && (
              <div className="relative">
                {/* Desktop User Info */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                      {auth.currentUser.email}
                    </span>
                  </div>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Logout
                    </button>
                  )}
                </div>

                {/* Mobile User Menu */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="User menu"
                  >
                    {showUserMenu ? (
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>

                  {/* Mobile Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {auth.currentUser.email}
                          </span>
                        </div>
                      </div>
                      {onLogout && (
                        <button
                          onClick={() => {
                            onLogout()
                            setShowUserMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Logout
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close mobile menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30 sm:hidden" 
          onClick={() => setShowUserMenu(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  )
}