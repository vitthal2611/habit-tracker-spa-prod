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
    <div className="max-w-4xl mx-auto space-y-3 px-2 sm:px-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateDay(-1)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className={`px-6 py-3 rounded-xl font-bold text-center transition-all ${
          currentDate.toDateString() === new Date().toDateString()
            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg scale-105'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          <div className="text-sm">{formatDate(currentDate)}</div>
          {currentDate.toDateString() === new Date().toDateString() && (
            <div className="text-xs mt-1 opacity-90">📅 Today</div>
          )}
        </div>
        <button onClick={() => navigateDay(1)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {totalScheduled.length > 0 && (
        <div className="space-y-2 mb-3">
          <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalScheduled.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedToday}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Done</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{missedToday}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Missed</div>
          </div>
        </div>
        {pendingToday === 0 && totalScheduled.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            {showAll ? '✓ Hide Completed' : '👁️ Show All Habits'}
          </button>
        )}
        </div>
      )}

      {dayHabits.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-lg">
          <div className="text-6xl mb-4 animate-bounce">✓</div>
          <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">All Done!</h3>
          <p className="text-base text-gray-600 dark:text-gray-400">{completedToday} completed, {missedToday} missed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayHabits.map((habit) => {
            const isCompleted = habit.completions && habit.completions[dateStr] === true
            const isMissed = habit.completions && habit.completions[dateStr] === false
            
            return (
              <div key={habit.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:scale-[1.01] animate-fade-in">
                <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-4 cursor-pointer hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 transition-all" onClick={() => onEdit && onEdit(habit)}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all"></div>
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {habit.currentHabit && (
                        <div className="inline-flex items-center gap-1 bg-white/25 backdrop-blur-md rounded-full px-3 py-1 mb-2">
                          <span className="text-xs font-bold text-white">🔗 After: {habit.currentHabit}</span>
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-white leading-tight mb-1">{habit.newHabit || habit.habit}</h3>
                      <p className="text-sm text-white/80 italic">
                        {habit.habitStatement || (habit.currentHabit 
                          ? `After I ${habit.currentHabit}, I will ${habit.newHabit || habit.habit}`
                          : `I will ${habit.newHabit || habit.habit}`)}
                      </p>
                      <p className="text-xs text-white/60 mt-1">✏️ Click to edit</p>
                    </div>
                    {habit.streak > 0 && (
                      <div className="flex-shrink-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl px-3 py-2 shadow-lg">
                        <div className="text-center">
                          <div className="text-2xl font-black text-white leading-none">{habit.streak}</div>
                          <div className="text-xs font-semibold text-white/90">🔥</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 flex gap-3">
                  <button
                    onClick={() => { if (!isCompleted) onToggle(habit.id, dateStr) }}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all transform active:scale-95 min-h-[52px] ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/40 hover:shadow-xl' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 border-2 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => { if (isCompleted) onToggle(habit.id, dateStr) }}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all transform active:scale-95 min-h-[52px] ${
                      isMissed 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/40 hover:shadow-xl' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 border-2 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isMissed ? '✕ Skipped' : 'Skip Today'}
                  </button>
                </div>

                {(habit.environmentTips || habit.makeAttractive || habit.makeEasy || habit.makeSatisfying) && (
                  <details className="group/details">
                    <summary className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t-2 border-blue-200 dark:border-blue-800 cursor-pointer hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all list-none">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <span className="text-lg">💡</span> 4 Laws Strategy
                        </span>
                        <span className="text-blue-500 dark:text-blue-400 group-open/details:rotate-180 transition-transform duration-300">▼</span>
                      </div>
                    </summary>
                    <div className="px-4 py-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 space-y-3">
                      {habit.environmentTips && (
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl border-l-4 border-amber-500 shadow-sm">
                          <span className="text-xl flex-shrink-0">👁️</span>
                          <div className="text-sm"><span className="font-bold text-amber-800 dark:text-amber-300">Make it Obvious:</span> <span className="text-gray-700 dark:text-gray-300">{habit.environmentTips}</span></div>
                        </div>
                      )}
                      {habit.makeAttractive && (
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border-l-4 border-purple-500 shadow-sm">
                          <span className="text-xl flex-shrink-0">✨</span>
                          <div className="text-sm"><span className="font-bold text-purple-800 dark:text-purple-300">Make it Attractive:</span> <span className="text-gray-700 dark:text-gray-300">{habit.makeAttractive}</span></div>
                        </div>
                      )}
                      {habit.makeEasy && (
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                          <span className="text-xl flex-shrink-0">⚡</span>
                          <div className="text-sm"><span className="font-bold text-emerald-800 dark:text-emerald-300">Make it Easy (2-Min):</span> <span className="text-gray-700 dark:text-gray-300">{habit.makeEasy}</span></div>
                        </div>
                      )}
                      {habit.makeSatisfying && (
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/30 rounded-xl border-l-4 border-rose-500 shadow-sm">
                          <span className="text-xl flex-shrink-0">🎯</span>
                          <div className="text-sm"><span className="font-bold text-rose-800 dark:text-rose-300">Make it Satisfying:</span> <span className="text-gray-700 dark:text-gray-300">{habit.makeSatisfying}</span></div>
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
