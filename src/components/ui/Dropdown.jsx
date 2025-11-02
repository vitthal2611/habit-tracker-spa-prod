import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

export default function Dropdown({ options, value, onChange, onAddNew, placeholder, label }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input flex items-center justify-between"
      >
        <span className={value ? '' : 'text-gray-500'}>{value || placeholder}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 card animate-fade-in">
          <div className="max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => { onChange(option); setIsOpen(false) }}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
              >
                {option}
              </button>
            ))}
            {onAddNew && (
              <button
                type="button"
                onClick={() => { onAddNew(); setIsOpen(false) }}
                className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700"
              >
                <Plus className="w-4 h-4" /> Add New
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}