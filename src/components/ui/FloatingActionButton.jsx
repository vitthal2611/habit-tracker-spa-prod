import { Plus } from 'lucide-react'

export default function FloatingActionButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 active:scale-95 z-50 animate-pulse-glow ${className}`}
      aria-label="Add new habit"
    >
      <Plus className="w-8 h-8 mx-auto" />
    </button>
  )
}