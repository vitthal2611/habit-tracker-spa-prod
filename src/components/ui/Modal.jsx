import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e) => e.key === 'Escape' && onClose()
      document.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-full max-w-md card animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="secondary" size="sm" onClick={onClose} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}