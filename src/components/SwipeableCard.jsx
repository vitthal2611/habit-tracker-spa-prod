import { useState, useRef } from 'react'
import { Check, Trash2 } from 'lucide-react'

export default function SwipeableCard({ 
  children, 
  onSwipeRight, 
  onSwipeLeft,
  rightAction = 'complete',
  leftAction = 'delete',
  disabled = false
}) {
  const [offset, setOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const handleTouchStart = (e) => {
    if (disabled) return
    startX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (disabled || !isSwiping) return
    currentX.current = e.touches[0].clientX
    const diff = currentX.current - startX.current
    setOffset(diff)
  }

  const handleTouchEnd = () => {
    if (disabled || !isSwiping) return
    
    const threshold = 100
    
    if (offset > threshold && onSwipeRight) {
      // Swipe right action
      if (navigator.vibrate) navigator.vibrate(50)
      onSwipeRight()
    } else if (offset < -threshold && onSwipeLeft) {
      // Swipe left action
      if (navigator.vibrate) navigator.vibrate(50)
      onSwipeLeft()
    }
    
    setOffset(0)
    setIsSwiping(false)
  }

  const getBackgroundColor = () => {
    if (offset > 50) return 'bg-green-500'
    if (offset < -50) return 'bg-red-500'
    return 'bg-gray-200 dark:bg-gray-700'
  }

  const getActionIcon = () => {
    if (offset > 50) {
      return <Check className="w-6 h-6 text-white" />
    }
    if (offset < -50) {
      return <Trash2 className="w-6 h-6 text-white" />
    }
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background action indicators */}
      <div className={`absolute inset-0 ${getBackgroundColor()} transition-colors flex items-center ${offset > 0 ? 'justify-start pl-6' : 'justify-end pr-6'}`}>
        {getActionIcon()}
      </div>
      
      {/* Swipeable content */}
      <div
        className="relative transition-transform touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
