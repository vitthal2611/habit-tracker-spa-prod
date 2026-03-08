export default function Card({ children, className = '', ...props }) {
  return <div className={`card p-4 sm:p-6 ${className}`} {...props}>{children}</div>
}