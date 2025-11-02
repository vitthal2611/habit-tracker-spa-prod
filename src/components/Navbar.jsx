import { Moon, Sun, Target } from 'lucide-react'
import Button from './ui/Button'
import { useDarkMode } from '../hooks/useDarkMode'

const Navbar = () => {
  const [isDark, setIsDark] = useDarkMode()

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Habit Tracker
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Build better habits
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              className="p-2"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar