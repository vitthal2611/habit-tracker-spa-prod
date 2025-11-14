import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DailyHabitView({ habits, onToggle }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
  }

  const getDayHabits = () => {
    const dateStr = currentDate.toDateString()
    const dayName = currentDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = currentDate.toISOString().split('T')[0]

    return habits
      .filter(habit => {
        const isScheduledByDay = !habit.schedule || habit.schedule.length === 0 || habit.schedule.includes(dayName)
        const isScheduledByDate = habit.specificDates && habit.specificDates.includes(dateKey)
        return isScheduledByDay || isScheduledByDate
      })
      .sort((a, b) => {
        const timeA = a.time || 'ZZ:ZZ'
        const timeB = b.time || 'ZZ:ZZ'
        if (timeA === 'Anytime') return 1
        if (timeB === 'Anytime') return -1
        return timeA.localeCompare(timeB)
      })
  }

  const dayHabits = getDayHabits()
  const dateStr = currentDate.toDateString()
  
  // Calculate motivational metrics
  const totalScheduled = habits.filter(h => {
    const dayName = currentDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = currentDate.toISOString().split('T')[0]
    const isScheduledByDay = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
    const isScheduledByDate = h.specificDates && h.specificDates.includes(dateKey)
    return isScheduledByDay || isScheduledByDate
  })
  
  const completedToday = totalScheduled.filter(h => h.completions && h.completions[dateStr] === true).length
  const missedToday = totalScheduled.filter(h => h.completions && h.completions[dateStr] === false).length
  const completionRate = totalScheduled.length > 0 ? Math.round((completedToday / totalScheduled.length) * 100) : 0
  
  // Calculate streak for today
  const getStreak = () => {
    let streak = 0
    const today = new Date(currentDate)
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const checkDateStr = checkDate.toDateString()
      const dayName = checkDate.toLocaleDateString('en', { weekday: 'short' })
      
      const dayHabits = habits.filter(h => {
        const isScheduled = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
        return isScheduled
      })
      
      if (dayHabits.length === 0) continue
      
      const completed = dayHabits.filter(h => h.completions && h.completions[checkDateStr]).length
      if (completed === dayHabits.length) {
        streak++
      } else {
        break
      }
    }
    return streak
  }
  
  const currentStreak = getStreak()
  const remaining = dayHabits.length

  return (
    <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 px-2 sm:px-4">
      {/* Date Navigation - Minimal */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <button
          onClick={() => navigateDay(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(currentDate)}</div>
        </div>
        
        <button
          onClick={() => navigateDay(1)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Metrics */}
      {totalScheduled.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center border border-blue-200 dark:border-blue-800">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{totalScheduled.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center border border-green-200 dark:border-green-800">
            <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{completedToday}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Done</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center border border-red-200 dark:border-red-800">
            <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{missedToday}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Missed</div>
          </div>
        </div>
      )}

      {dayHabits.length === 0 ? (
        <div className="text-center py-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-4xl mb-3">✓</div>
          <h3 className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400 mb-1">All habits reviewed</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 px-4">{completedToday} completed, {missedToday} missed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayHabits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3">
                <div className="text-center mb-3">
                  <div className="text-sm sm:text-base font-bold text-white">👤 {habit.identity || 'Building my identity'}</div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-bold text-white mb-1 line-clamp-2">{habit.newHabit || habit.habit || 'No Habit'}</div>
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      {habit.time && <span className="flex items-center gap-1">🕐 {habit.time}</span>}
                      {habit.location && <span className="flex items-center gap-1 truncate">📍 {habit.location}</span>}
                    </div>
                  </div>
                  {habit.streak > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 ml-2 flex-shrink-0">
                      <div className="text-xs text-white/80">Streak</div>
                      <div className="text-base sm:text-lg font-bold text-white text-center">{habit.streak}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                {/* Implementation Intention */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border-l-4 border-blue-500">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">📍 Implementation</div>
                  <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                    {habit.prefix && habit.currentHabit 
                      ? `${habit.prefix} I ${habit.currentHabit}${habit.location ? ` at ${habit.location}` : ''}${habit.time ? ` at ${habit.time}` : ''}, I will ${habit.newHabit || habit.habit}`
                      : `${habit.time ? `At ${habit.time}` : ''}${habit.location ? ` in ${habit.location}` : ''}, I will ${habit.newHabit || habit.habit}`}
                  </div>
                </div>

                {/* Environment Cues */}
                {habit.environmentTips && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 border-l-4 border-yellow-500">
                    <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">🔔 Make it Obvious</div>
                    <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">{habit.environmentTips}</div>
                  </div>
                )}

                {/* Make it Attractive */}
                {habit.makeAttractive && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 border-l-4 border-purple-500">
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">💜 Attractive</div>
                    <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">{habit.makeAttractive}</div>
                  </div>
                )}

                {/* Make it Easy */}
                {habit.makeEasy && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border-l-4 border-green-500">
                    <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">⚡ 2-Min Version</div>
                    <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">{habit.makeEasy}</div>
                  </div>
                )}

                {/* Make it Satisfying */}
                {habit.makeSatisfying && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 border-l-4 border-orange-500">
                    <div className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">🎯 Satisfying</div>
                    <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">{habit.makeSatisfying}</div>
                  </div>
                )}

                {/* Schedule */}
                {habit.schedule && habit.schedule.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">📅</span>
                    <div className="flex flex-wrap gap-1">
                      {habit.schedule.map(day => (
                        <span key={day} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{day}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quadrant */}
                {habit.quadrant && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">📊</span> {habit.quadrant}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    const isCompleted = habit.completions && habit.completions[dateStr]
                    if (!isCompleted) onToggle(habit.id, dateStr)
                  }}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 ${
                    habit.completions && habit.completions[dateStr]
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  ✓ Completed
                </button>
                <button
                  onClick={() => {
                    const isCompleted = habit.completions && habit.completions[dateStr]
                    if (isCompleted) onToggle(habit.id, dateStr)
                  }}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 ${
                    habit.completions && habit.completions[dateStr]
                      ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                      : 'bg-red-500 text-white shadow-md'
                  }`}
                >
                  ✕ Missed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Atomic Habits Wisdom */}
      <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border-l-4 border-gray-300 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remember</div>
        <div className="text-xs text-gray-700 dark:text-gray-300 italic">
          {remaining === 0 
            ? '"You do not rise to the level of your goals. You fall to the level of your systems."'
            : remaining === 1
            ? '"Every action you take is a vote for the type of person you wish to become."'
            : currentStreak > 0
            ? '"The secret to getting results is to never miss twice."'
            : '"Habits are the compound interest of self-improvement."'
          }
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">— James Clear</div>
      </div>
    </div>
  )
}
