export default function Input({ className = '', ...props }) {
  return <input className={`input min-h-[48px] text-[16px] px-4 py-3 ${className}`} {...props} />
}