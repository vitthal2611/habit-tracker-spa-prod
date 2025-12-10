import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true, 
  icon: Icon,
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-strong border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-friendly focus-ring"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {Icon && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          )}
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-4 sm:p-6 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}