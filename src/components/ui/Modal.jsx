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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] card animate-slide-up sm:animate-scale-in overflow-hidden flex flex-col sm:rounded-2xl rounded-t-2xl">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}