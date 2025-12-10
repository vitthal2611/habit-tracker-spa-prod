import { Plus } from 'lucide-react'

export default function StickyAddButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-strong hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center touch-friendly focus-ring ${className}`}
      aria-label="Add new habit"
    >
      <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
    </button>
  )
}