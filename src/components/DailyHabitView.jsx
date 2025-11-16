import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DailyHabitView({ habits, onToggle, onEdit }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAll, setShowAll] = useState(false)

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

    return habits.filter(habit => {
      const habitStartDate = new Date(habit.createdAt || habit.id)
      const currentDateOnly = new Date(currentDate)
      habitStartDate.setHours(0, 0, 0, 0)
      currentDateOnly.setHours(0, 0, 0, 0)
      
      if (currentDateOnly < habitStartDate) return false
      
      const isScheduledByDay = !habit.schedule || habit.schedule.length === 0 || habit.schedule.includes(dayName)
      const isScheduledByDate = habit.specificDates && habit.specificDates.includes(dateKey)
      const isScheduled = isScheduledByDay || isScheduledByDate
      
      if (!isScheduled) return false
      if (showAll) return true
      
      const hasAction = habit.completions && (habit.completions[dateStr] === true || habit.completions[dateStr] === false)
      return !hasAction
    })
  }

  const dayHabits = getDayHabits()
  const dateStr = currentDate.toDateString()
  
  const totalScheduled = habits.filter(h => {
    const habitStartDate = new Date(h.createdAt || h.id)
    const currentDateOnly = new Date(currentDate)
    habitStartDate.setHours(0, 0, 0, 0)
    currentDateOnly.setHours(0, 0, 0, 0)
    
    if (currentDateOnly < habitStartDate) return false
    
    const dayName = currentDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = currentDate.toISOString().split('T')[0]
    const isScheduledByDay = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
    const isScheduledByDate = h.specificDates && h.specificDates.includes(dateKey)
    return isScheduledByDay || isScheduledByDate
  })
  
  const completedToday = totalScheduled.filter(h => h.completions && h.completions[dateStr] === true).length
  const missedToday = totalScheduled.filter(h => h.completions && h.completions[dateStr] === false).length
  const pendingToday = totalScheduled.length - completedToday - missedToday

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button onClick={() => navigateDay(-1)} className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow-md min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 mx-2 sm:mx-4">
            <div className="font-display text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">{formatDate(currentDate)}</div>
            {currentDate.toDateString() === new Date().toDateString() && (
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Today
              </div>
            )}
          </div>
          <button onClick={() => navigateDay(1)} className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow-md min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        {totalScheduled.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white dark:bg-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-sm border border-gray-100 dark:border-gray-600">
              <div className="text-2xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">{totalScheduled.length}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-lg">
              <div className="text-2xl sm:text-4xl font-display font-bold text-white mb-0.5 sm:mb-1">{completedToday}</div>
              <div className="text-xs sm:text-sm font-semibold text-white/90">Done</div>
            </div>
            <div className="bg-white dark:bg-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-sm border border-gray-100 dark:border-gray-600">
              <div className="text-2xl sm:text-4xl font-display font-bold text-gray-400 dark:text-gray-500 mb-0.5 sm:mb-1">{missedToday}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Skip</div>
            </div>
          </div>
        )}

        {pendingToday === 0 && totalScheduled.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            {showAll ? 'Hide Completed' : 'Show All Habits'}
          </button>
        )}
      </div>

      {/* Habits Section */}
      {dayHabits.length === 0 ? (
        <div className="text-center py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl shadow-sm border border-green-100 dark:border-gray-700">
          <div className="text-8xl mb-6">🎉</div>
          <h3 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-3">Perfect Day!</h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">All habits completed</p>
          <div className="inline-flex items-center gap-6 bg-white/80 dark:bg-gray-700/50 backdrop-blur-sm rounded-2xl px-10 py-5 shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-green-600 dark:text-green-400 mb-1">{completedToday}</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            {missedToday > 0 && (
              <>
                <div className="w-px h-16 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-gray-400 dark:text-gray-500 mb-1">{missedToday}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Skipped</div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {dayHabits.map((habit) => {
            const isCompleted = habit.completions && habit.completions[dateStr] === true
            const isMissed = habit.completions && habit.completions[dateStr] === false
            
            const habitStartDate = new Date(habit.createdAt || habit.id)
            const currentDateOnly = new Date(currentDate)
            habitStartDate.setHours(0, 0, 0, 0)
            currentDateOnly.setHours(0, 0, 0, 0)
            const daysSinceStart = Math.floor((currentDateOnly - habitStartDate) / (1000 * 60 * 60 * 24)) + 1
            
            return (
              <div key={habit.id} className="group bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 animate-fade-in">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                        {habit.identity && (
                          <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-sm">
                            <span>⭐</span>
                            {habit.identity}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold">
                          <span>📅</span>
                          Day {daysSinceStart}
                        </span>
                        {habit.time && (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium">
                            <span>⏰</span>
                            {habit.time}
                          </span>
                        )}
                        {habit.location && (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium">
                            <span>📍</span>
                            {habit.location}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">{habit.newHabit || habit.habit}</h3>
                      
                      {habit.currentHabit && (
                        <div className="flex items-start gap-2 sm:gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 border border-blue-100 dark:border-blue-800">
                          <span className="text-lg sm:text-2xl flex-shrink-0">⚡</span>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            After <span className="font-bold text-blue-600 dark:text-blue-400">{habit.currentHabit}</span>, I will <span className="font-bold text-indigo-600 dark:text-indigo-400">{habit.newHabit || habit.habit}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {habit.streak > 0 && (
                      <div className="flex-shrink-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 shadow-lg">
                        <div className="text-center">
                          <div className="font-display text-2xl sm:text-4xl font-bold text-white leading-none mb-0.5 sm:mb-1">{habit.streak}</div>
                          <div className="text-xs font-bold text-white/90 uppercase tracking-wide hidden sm:block">Day Streak</div>
                          <div className="text-lg sm:text-2xl mt-0.5 sm:mt-1">🔥</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => { if (!isCompleted && currentDateOnly <= new Date().setHours(0,0,0,0)) onToggle(habit.id, dateStr) }}
                      disabled={isCompleted || currentDateOnly > new Date().setHours(0,0,0,0)}
                      className={`flex-1 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all transform active:scale-95 min-h-[52px] sm:min-h-[60px] ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg cursor-default' 
                          : currentDateOnly > new Date().setHours(0,0,0,0)
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-xl'
                      }`}
                    >
                      {isCompleted ? '✓ Done' : 'Complete'}
                    </button>
                    <button
                      onClick={() => { if (isCompleted && currentDateOnly <= new Date().setHours(0,0,0,0)) onToggle(habit.id, dateStr) }}
                      disabled={isMissed || currentDateOnly > new Date().setHours(0,0,0,0)}
                      className={`flex-1 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all transform active:scale-95 min-h-[52px] sm:min-h-[60px] ${
                        isMissed 
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg cursor-default' 
                          : currentDateOnly > new Date().setHours(0,0,0,0)
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isMissed ? '✕ Skip' : 'Skip'}
                    </button>
                  </div>
                </div>

                {(habit.environmentTips || habit.makeAttractive || habit.makeEasy || habit.makeSatisfying) && (
                  <details className="group/details">
                    <summary className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-all list-none">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="text-lg">💡</span> 4 Laws Strategy
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 group-open/details:rotate-180 transition-transform duration-300">▼</span>
                      </div>
                    </summary>
                    <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/30 space-y-3">
                      {habit.environmentTips && (
                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800">
                          <span className="text-xl flex-shrink-0">👁️</span>
                          <div className="text-sm"><span className="font-bold text-gray-900 dark:text-white">Make it Obvious:</span> <span className="text-gray-600 dark:text-gray-400">{habit.environmentTips}</span></div>
                        </div>
                      )}
                      {habit.makeAttractive && (
                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800">
                          <span className="text-xl flex-shrink-0">✨</span>
                          <div className="text-sm"><span className="font-bold text-gray-900 dark:text-white">Make it Attractive:</span> <span className="text-gray-600 dark:text-gray-400">{habit.makeAttractive}</span></div>
                        </div>
                      )}
                      {habit.makeEasy && (
                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <span className="text-xl flex-shrink-0">⚡</span>
                          <div className="text-sm"><span className="font-bold text-gray-900 dark:text-white">Make it Easy (2-Min):</span> <span className="text-gray-600 dark:text-gray-400">{habit.makeEasy}</span></div>
                        </div>
                      )}
                      {habit.makeSatisfying && (
                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-200 dark:border-rose-800">
                          <span className="text-xl flex-shrink-0">🎯</span>
                          <div className="text-sm"><span className="font-bold text-gray-900 dark:text-white">Make it Satisfying:</span> <span className="text-gray-600 dark:text-gray-400">{habit.makeSatisfying}</span></div>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
