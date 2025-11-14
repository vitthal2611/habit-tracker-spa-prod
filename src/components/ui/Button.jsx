export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const sizes = { 
    sm: 'px-4 py-2.5 text-sm min-h-[44px]', 
    md: 'px-5 py-3 text-base min-h-[48px]', 
    lg: 'px-6 py-4 text-lg min-h-[52px]' 
  }
  const variants = { 
    primary: 'btn-primary shadow-md hover:shadow-lg active:scale-95', 
    secondary: 'btn-secondary active:scale-95' 
  }
  
  return (
    <button className={`btn ${variants[variant]} ${sizes[size]} ${className} font-semibold`} {...props}>
      {children}
    </button>
  )
}