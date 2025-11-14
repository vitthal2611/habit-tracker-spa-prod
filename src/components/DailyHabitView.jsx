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
        <div className="space-y-4">
          {dayHabits.map((habit) => {
            const isCompleted = habit.completions && habit.completions[dateStr] === true
            const isMissed = habit.completions && habit.completions[dateStr] === false
            
            return (
            <div
              key={habit.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all"
            >
              {/* Premium Header */}
              <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-5">
                {/* Identity Badge - Top Center */}
                <div className="flex justify-center mb-3">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/30">
                    <span className="text-lg">👤</span>
                    <span className="text-sm font-semibold text-white">{habit.identity || 'Building identity'}</span>
                  </div>
                </div>

                {/* Habit Title & Meta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">{habit.newHabit || habit.habit || 'Habit'}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      {habit.time && (
                        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-base">🕐</span>
                          <span className="text-sm font-medium text-white">{habit.time}</span>
                        </div>
                      )}
                      {habit.location && (
                        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-base">📍</span>
                          <span className="text-sm font-medium text-white truncate">{habit.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Streak Badge */}
                  {habit.streak > 0 && (
                    <div className="flex-shrink-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl px-3 py-2 shadow-lg">
                      <div className="text-center">
                        <div className="text-2xl font-black text-white leading-none">{habit.streak}</div>
                        <div className="text-xs font-semibold text-white/90 mt-0.5">🔥 Day</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 space-y-3">
                {/* Implementation Intention - Primary with Hover */}
                <div className="group relative">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800 cursor-help transition-all hover:shadow-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-base">📍</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Implementation</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                          {habit.habitStatement || (habit.prefix && habit.currentHabit 
                            ? `${habit.prefix} I ${habit.currentHabit}${habit.time ? ` at ${habit.time}` : ''}${habit.location ? ` in the ${habit.location}` : ''}, I will ${habit.newHabit || habit.habit}`
                            : `${habit.time ? `At ${habit.time}` : ''}${habit.location ? ` in the ${habit.location}` : ''}, I will ${habit.newHabit || habit.habit}`)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Popup - 4 Laws */}
                  {(habit.environmentTips || habit.makeAttractive || habit.makeEasy || habit.makeSatisfying) && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                        {habit.environmentTips && (
                          <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <span className="text-base flex-shrink-0">👁️</span>
                            <div>
                              <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Obvious</div>
                              <div className="text-xs text-gray-700 dark:text-gray-300">{habit.environmentTips}</div>
                            </div>
                          </div>
                        )}
                        {habit.makeAttractive && (
                          <div className="flex items-start gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <span className="text-base flex-shrink-0">✨</span>
                            <div>
                              <div className="text-xs font-bold text-purple-700 dark:text-purple-400">Attractive</div>
                              <div className="text-xs text-gray-700 dark:text-gray-300">{habit.makeAttractive}</div>
                            </div>
                          </div>
                        )}
                        {habit.makeEasy && (
                          <div className="flex items-start gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <span className="text-base flex-shrink-0">⚡</span>
                            <div>
                              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">2-Min Easy</div>
                              <div className="text-xs text-gray-700 dark:text-gray-300">{habit.makeEasy}</div>
                            </div>
                          </div>
                        )}
                        {habit.makeSatisfying && (
                          <div className="flex items-start gap-2 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <span className="text-base flex-shrink-0">🎯</span>
                            <div>
                              <div className="text-xs font-bold text-rose-700 dark:text-rose-400">Satisfying</div>
                              <div className="text-xs text-gray-700 dark:text-gray-300">{habit.makeSatisfying}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Make it Satisfying - Only visible section */}
                {habit.makeSatisfying && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 border border-rose-200 dark:border-rose-800">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 bg-rose-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">🎯</span>
                      </div>
                      <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Satisfying</div>
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{habit.makeSatisfying}</div>
                  </div>
                )}

                {/* Meta Info */}
                {(habit.schedule?.length > 0 || habit.quadrant) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {habit.schedule && habit.schedule.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">📅</span>
                        <div className="flex gap-1">
                          {habit.schedule.map(day => (
                            <span key={day} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">{day}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {habit.quadrant && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">📊 {habit.quadrant}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!isCompleted) onToggle(habit.id, dateStr)
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
                    }`}
                  >
                    <span className="text-lg">{isCompleted ? '✓' : '○'}</span>
                    <span>Completed</span>
                  </button>
                  <button
                    onClick={() => {
                      if (isCompleted) onToggle(habit.id, dateStr)
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      isMissed
                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500'
                    }`}
                  >
                    <span className="text-lg">{isMissed ? '✕' : '○'}</span>
                    <span>Missed</span>
                  </button>
                </div>
              </div>
            </div>
            )
          })}
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
