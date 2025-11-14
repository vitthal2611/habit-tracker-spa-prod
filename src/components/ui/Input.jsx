export default function Input({ className = '', ...props }) {
  return <input className={`input min-h-[48px] text-base ${className}`} {...props} />
}