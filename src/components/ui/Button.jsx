export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
  const sizes = { 
    sm: 'px-4 py-2.5 text-sm min-h-[44px]', 
    md: 'px-5 py-3 text-sm font-bold min-h-[48px]', 
    lg: 'px-6 py-4 text-base font-bold min-h-[52px]' 
  }
  
  const variants = { 
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed', 
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
    warning: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
    info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
    accent: 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 focus:ring-yellow-400 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
  }
  
  return (
    <button 
      className={`inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 touch-manipulation uppercase tracking-wide ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}