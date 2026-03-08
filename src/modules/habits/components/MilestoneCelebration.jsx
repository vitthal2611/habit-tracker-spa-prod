import { useEffect, useState } from 'react'
import { Share2, X } from 'lucide-react'

export default function MilestoneCelebration({ milestone, habitName, onClose, onShare }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const getMilestoneConfig = () => {
    if (milestone >= 100) return { emoji: '💎', color: 'from-yellow-400 to-amber-500', message: 'Diamond Streak!' }
    if (milestone >= 30) return { emoji: '🏆', color: 'from-purple-500 to-pink-500', message: 'Champion!' }
    if (milestone >= 7) return { emoji: '🎉', color: 'from-blue-500 to-indigo-600', message: 'Week Strong!' }
    return { emoji: '🔥', color: 'from-orange-500 to-red-500', message: 'Great Start!' }
  }

  const config = getMilestoneConfig()

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onTouchStart={(e) => {
        const startY = e.touches[0].clientY
        const handleTouchMove = (e) => {
          const currentY = e.touches[0].clientY
          if (currentY - startY > 100) {
            handleClose()
          }
        }
        document.addEventListener('touchmove', handleTouchMove)
        document.addEventListener('touchend', () => {
          document.removeEventListener('touchmove', handleTouchMove)
        }, { once: true })
      }}
    >
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {['🎉', '⭐', '✨', '🎊', '💫'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      {/* Celebration Card */}
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-90'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`bg-gradient-to-br ${config.color} p-8 rounded-t-3xl text-center`}>
          <div className="text-8xl mb-4 animate-bounce">{config.emoji}</div>
          <h2 className="text-3xl font-black text-white mb-2">{config.message}</h2>
          <p className="text-white/90 text-lg font-semibold">{habitName}</p>
        </div>

        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl font-black text-gray-900 dark:text-white mb-2">
              {milestone}
            </div>
            <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
              Day Streak! 🔥
            </div>
          </div>

          {/* Streak Visualization */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(Math.min(milestone, 10))].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-12 rounded-full bg-gradient-to-t ${config.color} animate-pulse`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-4 rounded-xl font-bold text-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
            >
              Continue
            </button>
            <button
              onClick={() => {
                onShare && onShare(milestone, habitName)
                handleClose()
              }}
              className={`flex-1 py-4 rounded-xl font-bold text-lg bg-gradient-to-r ${config.color} text-white hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}
