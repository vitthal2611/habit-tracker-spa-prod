export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = { primary: 'btn-primary', secondary: 'btn-secondary' }
  
  return (
    <button className={`btn ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}