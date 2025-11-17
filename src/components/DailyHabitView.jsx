import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DailyHabitView({ habits, onToggle, onEdit, onDelete }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAll, setShowAll] = useState(false)
  const [showDeleteFor, setShowDeleteFor] = useState(null)

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
                      {habit.currentHabit && (
                        <div 
                          onDoubleClick={() => onEdit(habit)}
                          onClick={(e) => {
                            if (e.detail === 3) {
                              e.preventDefault();
                              setShowDeleteFor(showDeleteFor === habit.id ? null : habit.id);
                            }
                          }}
                          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200/60 dark:border-gray-700/60"
                        >
                          {/* Identity Header */}
                          <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-indigo-400 dark:text-indigo-500 text-base sm:text-lg flex-shrink-0">🎯</span>
                                <span className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 font-semibold truncate">I am {habit.identity || 'building this habit'}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {habit.streak > 0 && (
                                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-bold px-2 py-1 rounded-lg shadow-sm">
                                    {habit.streak}🔥
                                  </span>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
                                  className="text-slate-400 hover:text-red-500 transition-colors w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-lg active:scale-95"
                                  title="Delete habit"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Trigger with Context */}
                          <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-50/50 dark:bg-gray-750/50">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium flex-shrink-0">After I</span>
                                <span className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-semibold truncate">{habit.currentHabit}</span>
                              </div>
                              {(habit.time || habit.location) && (
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                  {habit.time && <span className="flex items-center gap-1">⏰ {habit.time}</span>}
                                  {habit.location && <span className="flex items-center gap-1">📍 {habit.location}</span>}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Main Habit Action */}
                          <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-br from-white to-slate-50/30 dark:from-gray-800 dark:to-gray-850/30">
                            <div className="mb-3">
                              <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-1.5">I will</div>
                              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug sm:leading-relaxed">{habit.newHabit || habit.habit}</h3>
                            </div>

                            {/* Inline Tips */}
                            {(habit.makeEasy || habit.environmentTips) && (
                              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-gray-700">
                                {habit.makeEasy && (
                                  <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                    <span className="text-emerald-500 flex-shrink-0 text-sm sm:text-base">⚡</span>
                                    <span className="leading-relaxed">{habit.makeEasy}</span>
                                  </div>
                                )}
                                {habit.environmentTips && (
                                  <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                    <span className="text-sky-500 flex-shrink-0 text-sm sm:text-base">👁️</span>
                                    <span className="leading-relaxed">{habit.environmentTips}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 7-Day Progress */}
                          <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-50/50 dark:bg-gray-750/50 border-t border-slate-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last 7 days</span>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                {(() => {
                                  const last7Days = [];
                                  for (let i = 6; i >= 0; i--) {
                                    const d = new Date(currentDate);
                                    d.setDate(d.getDate() - i);
                                    const dStr = d.toDateString();
                                    const status = habit.completions?.[dStr];
                                    last7Days.push(
                                      <div
                                        key={i}
                                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                                          status === true ? 'bg-emerald-500 shadow-sm' :
                                          status === false ? 'bg-slate-300 dark:bg-slate-600' :
                                          'bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600'
                                        }`}
                                        title={d.toLocaleDateString()}
                                      />
                                    );
                                  }
                                  return last7Days;
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="px-4 sm:px-5 py-3 sm:py-4 flex gap-2 sm:gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); if (!isCompleted && currentDateOnly <= new Date().setHours(0,0,0,0)) onToggle(habit.id, dateStr) }}
                              disabled={isCompleted || currentDateOnly > new Date().setHours(0,0,0,0)}
                              className={`flex-1 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all min-h-[44px] ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' 
                                  : currentDateOnly > new Date().setHours(0,0,0,0)
                                  ? 'bg-slate-100 dark:bg-gray-700/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-md hover:shadow-lg active:scale-98'
                              }`}
                            >
                              {isCompleted ? '✓ Completed' : '✓ Complete'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (!isMissed && currentDateOnly <= new Date().setHours(0,0,0,0)) onToggle(habit.id, dateStr) }}
                              disabled={isMissed || currentDateOnly > new Date().setHours(0,0,0,0)}
                              className={`px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all border-2 min-h-[44px] ${
                                isMissed 
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                                  : currentDateOnly > new Date().setHours(0,0,0,0)
                                  ? 'bg-slate-100 dark:bg-gray-700/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-gray-600 cursor-not-allowed'
                                  : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600 hover:border-slate-400 dark:hover:border-gray-500 active:scale-98'
                              }`}
                            >
                              {isMissed ? 'Skipped' : 'Skip'}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center justify-center gap-2">
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
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
