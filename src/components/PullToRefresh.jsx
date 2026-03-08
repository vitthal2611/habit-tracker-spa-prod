import { useState, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef(null)

  const threshold = 80

  const handleTouchStart = (e) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e) => {
    if (isRefreshing || !containerRef.current || containerRef.current.scrollTop > 0) return
    
    const currentY = e.touches[0].clientY
    const distance = currentY - startY.current
    
    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5))
      if (distance > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      if (navigator.vibrate) navigator.vibrate(50)
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh error:', error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const rotation = (pullDistance / threshold) * 360

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance / threshold
        }}
      >
        <div className={`${isRefreshing ? 'animate-spin' : ''}`}>
          <RefreshCw
            className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
            style={{
              transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isRefreshing ? threshold : pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  )
}
