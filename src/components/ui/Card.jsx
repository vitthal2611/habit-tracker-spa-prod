export default function Card({ children, className = '', padding = '20px', ...props }) {
  const paddingClass = padding === '20px' ? 'p-5' : padding === '16px' ? 'p-4' : 'p-6'
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ${paddingClass} ${className}`} 
      {...props}
    >
      {children}
    </div>
  )
}