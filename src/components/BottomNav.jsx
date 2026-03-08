import { Target, CheckSquare, DollarSign, BarChart3 } from 'lucide-react'

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'money', label: 'Money', icon: DollarSign },
    { id: 'stats', label: 'Stats', icon: BarChart3 }
  ]

  const handleTabClick = (tabId) => {
    // Haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    onTabChange(tabId)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
