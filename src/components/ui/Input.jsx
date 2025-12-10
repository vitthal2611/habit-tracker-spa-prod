import { forwardRef } from 'react'

const Input = forwardRef(({ className = '', error = false, label = '', ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input 
        ref={ref}
        className={`w-full px-4 py-3 text-sm border-2 rounded-xl bg-white dark:bg-gray-800 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[48px] touch-manipulation ${
          error 
            ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
        } focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${className}`} 
        {...props} 
      />
    </div>
  )
})

Input.displayName = 'Input'

export default Input