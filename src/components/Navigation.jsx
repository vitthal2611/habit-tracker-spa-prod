import { Home, Target, CheckSquare, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import Toggle from './ui/Toggle'

export default function Navigation({ activeTab, setActiveTab, onLogout }) {
  const [isDark, setIsDark] = useState(() => 
    localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', isDark)
  }, [isDark])

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'checkin', label: 'Check-in', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: Target },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Habit Tracker</h1>
            <div className="hidden md:flex space-x-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Toggle 
              checked={isDark} 
              onChange={(e) => setIsDark(e.target.checked)}
              label={isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            />
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex space-x-1 pb-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
        

      </div>
    </nav>
  )
}