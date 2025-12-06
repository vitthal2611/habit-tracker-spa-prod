import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import QuickHabitForm from './QuickHabitForm'
import Modal from './ui/Modal'

export default function DailyHabitView({ habits, onToggle, onDelete, onUpdate, onAdd, onDuplicate, currentDate: propCurrentDate, setCurrentDate: propSetCurrentDate, isSelectionMode = false, selectedHabits = new Set(), onToggleSelection }) {
  const [currentDate, setCurrentDate] = useState(propCurrentDate || new Date())
  const [showAll, setShowAll] = useState(false)
  const [completedHabit, setCompletedHabit] = useState(null)
  const [editingHabit, setEditingHabit] = useState(null)
  const [groupBy, setGroupBy] = useState('none')
  const [skipModal, setSkipModal] = useState({ isOpen: false, habitId: null, dateStr: null })
  const [skipNote, setSkipNote] = useState('')

  useEffect(() => {
    if (propCurrentDate) setCurrentDate(propCurrentDate)
  }, [propCurrentDate])

  const updateDate = (newDate) => {
    setCurrentDate(newDate)
    if (propSetCurrentDate) propSetCurrentDate(newDate)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') navigateDay(-1)
      if (e.key === 'ArrowRight') navigateDay(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentDate])

  const handleComplete = (habitId, dateStr) => {
    setCompletedHabit(habitId)
    setTimeout(() => setCompletedHabit(null), 1000)
    onToggle(habitId, dateStr)
  }

  const getMotivationalMessage = () => {
    const messages = [
      '🎉 Amazing work!',
      '💪 You\'re crushing it!',
      '⭐ Keep it up!',
      '🔥 On fire!',
      '✨ Fantastic!',
      '🚀 Unstoppable!'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    updateDate(newDate)
  }

  const getDayHabits = () => {
    const dateStr = currentDate.toDateString()
    const dayName = currentDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = currentDate.toISOString().split('T')[0]

    return habits.filter(habit => {
      const habitStartDate = new Date(habit.createdAt || habit.id)
      if (isNaN(habitStartDate.getTime())) return false
      
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

  const sortByTime = (habits) => {
    return [...habits].sort((a, b) => {
      const timeToMinutes = (time) => {
        if (!time || time === 'Anytime' || time === '') return 9999
        const parts = time.split(':')
        if (parts.length < 2) return 9999
        const hours = parseInt(parts[0], 10)
        const minutes = parseInt(parts[1], 10)
        if (isNaN(hours) || isNaN(minutes)) return 9999
        return hours * 60 + minutes
      }
      return timeToMinutes(a.time) - timeToMinutes(b.time)
    })
  }

  const groupHabits = (habits) => {
    const sorted = sortByTime(habits)
    if (groupBy === 'none') return { 'All': sorted }
    return sorted.reduce((acc, habit) => {
      const key = habit.identity || 'No Identity'
      if (!acc[key]) acc[key] = []
      acc[key].push(habit)
      return acc
    }, {})
  }

  const groupedHabits = groupHabits(dayHabits)
  
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-800 dark:to-indigo-950/20 rounded-2xl p-4 sm:p-6 shadow-md border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button onClick={() => navigateDay(-1)} className="p-2.5 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatDate(currentDate)}</div>
            {currentDate.toDateString() === new Date().toDateString() && (
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>TODAY
              </span>
            )}
          </div>
          <button onClick={() => navigateDay(1)} className="p-2.5 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm">
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {totalScheduled.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white dark:bg-gray-900/50 rounded-xl p-3 sm:p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white mb-1">{totalScheduled.length}</div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 sm:p-5 text-center shadow-lg">
              <div className="text-2xl sm:text-4xl font-black text-white mb-1">{completedToday}</div>
              <div className="text-xs font-bold text-white/90 uppercase tracking-wide">Done</div>
            </div>
            <div className="bg-white dark:bg-gray-900/50 rounded-xl p-3 sm:p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl sm:text-4xl font-black text-orange-500 dark:text-orange-400 mb-1">{missedToday}</div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Skipped</div>
            </div>
          </div>
        )}

        {totalScheduled.length > 0 && (
          <div className="mt-4 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.round((completedToday / totalScheduled.length) * 100)}%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500" style={{ width: `${(completedToday / totalScheduled.length) * 100}%` }}></div>
            </div>
          </div>
        )}

        {pendingToday === 0 && totalScheduled.length > 0 && (
          <button onClick={() => setShowAll(!showAll)} className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all">
            {showAll ? 'Hide Completed' : 'Show All Habits'}
          </button>
        )}
      </div>

      {/* Group By Toggle */}
      {dayHabits.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setGroupBy('none')}
              className={`px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                groupBy === 'none'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              No Grouping
            </button>
            <button
              onClick={() => setGroupBy('identity')}
              className={`px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                groupBy === 'identity'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              By Identity
            </button>
          </div>
        </div>
      )}

      {dayHabits.length === 0 ? (
        <div className="text-center py-24 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl shadow-md border-2 border-emerald-200 dark:border-emerald-800/30 animate-fade-in">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Perfect Day!</h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">All habits completed</p>
          <div className="inline-flex items-center gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-8 py-4 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{completedToday}</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-1">Completed</div>
            </div>
            {missedToday > 0 && (
              <>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-orange-500 dark:text-orange-400">{missedToday}</div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-1">Skipped</div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHabits).map(([groupName, groupHabits]) => (
            <div key={groupName} className="space-y-3">
              {groupBy !== 'none' && (
                <div className="px-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{groupName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{groupHabits.length} habit{groupHabits.length !== 1 ? 's' : ''}</p>
                </div>
              )}
              {groupHabits.map((habit) => {
            const isCompleted = habit.completions && habit.completions[dateStr] === true
            const isMissed = habit.completions && habit.completions[dateStr] === false
            
            const habitStartDate = new Date(habit.createdAt || habit.id)
            const currentDateOnly = new Date(currentDate)
            habitStartDate.setHours(0, 0, 0, 0)
            currentDateOnly.setHours(0, 0, 0, 0)
            const daysSinceStart = Math.floor((currentDateOnly - habitStartDate) / (1000 * 60 * 60 * 24)) + 1
            
            return (
              <div key={habit.id} className="animate-fade-in">
                {habit.currentHabit && (
                  <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
                    completedHabit === habit.id ? 'scale-[1.01] shadow-2xl' : ''
                  } ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700' : ''}`}>
                    
                    {/* Identity Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3 flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <span className="text-sm sm:text-lg font-bold text-white truncate">{habit.identity}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {habit.streak > 0 && (
                          <span className="bg-orange-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                            🔥 {habit.streak}
                          </span>
                        )}
                        {isSelectionMode ? (
                          <input
                            type="checkbox"
                            checked={selectedHabits.has(habit.id)}
                            onChange={() => onToggleSelection(habit.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        ) : (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingHabit(habit); }} 
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                              title="Edit habit"
                            >
                              ✎
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }} 
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Main Content Row */}
                    <div className="p-4 sm:p-6">
                      {/* Mobile Layout */}
                      <div className="block lg:hidden space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {habit.time || '--:--'}
                          </div>
                          <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex-1 text-right">{habit.newHabit}</div>
                        </div>
                        {habit.location && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">📍 {habit.location}</div>
                        )}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">After I</div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{habit.currentHabit}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">I will</div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{habit.newHabit}</div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (!isCompleted && currentDateOnly <= new Date().setHours(0,0,0,0)) {
                                handleComplete(habit.id, dateStr)
                              }
                            }}
                            disabled={isCompleted || currentDateOnly > new Date().setHours(0,0,0,0)}
                            className={`flex-1 py-3 rounded-lg font-bold text-base transition-all ${
                              isCompleted 
                                ? 'bg-emerald-500 text-white' 
                                : currentDateOnly > new Date().setHours(0,0,0,0) 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                            }`}
                          >
                            {isCompleted ? '✓ Done' : '✓ Complete'}
                          </button>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (!isMissed && currentDateOnly <= new Date().setHours(0,0,0,0)) {
                                setSkipModal({ isOpen: true, habitId: habit.id, dateStr })
                              }
                            }}
                            disabled={isMissed || currentDateOnly > new Date().setHours(0,0,0,0)}
                            className={`px-6 py-3 rounded-lg font-bold text-base transition-all ${
                              isMissed 
                                ? 'bg-red-500 text-white' 
                                : currentDateOnly > new Date().setHours(0,0,0,0) 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95'
                            }`}
                          >
                            {isMissed ? '✗' : 'Skip'}
                          </button>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:grid grid-cols-12 gap-4 items-center mb-4">
                        {/* Time */}
                        <div className="col-span-2 text-center">
                          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {habit.time || '--:--'}
                          </div>
                          {habit.location && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{habit.location}</div>
                          )}
                        </div>

                        {/* Habit Name */}
                        <div className="col-span-2">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{habit.newHabit}</div>
                        </div>

                        {/* After Statement */}
                        <div className="col-span-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">After I</div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{habit.currentHabit}</div>
                        </div>

                        {/* I Will Statement */}
                        <div className="col-span-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">I will</div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{habit.newHabit}</div>
                        </div>

                        {/* Action Buttons */}
                        <div className="col-span-2 flex gap-2">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (!isCompleted && currentDateOnly <= new Date().setHours(0,0,0,0)) {
                                handleComplete(habit.id, dateStr)
                              }
                            }}
                            disabled={isCompleted || currentDateOnly > new Date().setHours(0,0,0,0)}
                            className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                              isCompleted 
                                ? 'bg-emerald-500 text-white' 
                                : currentDateOnly > new Date().setHours(0,0,0,0) 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                            }`}
                          >
                            {isCompleted ? '✓' : '✓'}
                          </button>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (!isMissed && currentDateOnly <= new Date().setHours(0,0,0,0)) {
                                setSkipModal({ isOpen: true, habitId: habit.id, dateStr })
                              }
                            }}
                            disabled={isMissed || currentDateOnly > new Date().setHours(0,0,0,0)}
                            className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                              isMissed 
                                ? 'bg-red-500 text-white' 
                                : currentDateOnly > new Date().setHours(0,0,0,0) 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95'
                            }`}
                          >
                            {isMissed ? '✗' : '✗'}
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex gap-1 mt-4">
                        {(() => {
                          const dots = [];
                          for (let i = 6; i >= 0; i--) {
                            const d = new Date(currentDate);
                            d.setDate(d.getDate() - i);
                            const status = habit.completions?.[d.toDateString()];
                            dots.push(
                              <div key={i} className="flex-1 h-2 rounded-full" style={{
                                background: status === true ? '#10b981' : status === false ? '#ef4444' : '#e5e7eb'
                              }} />
                            );
                          }
                          return dots;
                        })()}
                      </div>

                      {/* Motivational Message */}
                      {completedHabit === habit.id && (
                        <div className="text-center mt-3 animate-fade-in">
                          <span className="inline-block px-4 py-1 bg-emerald-500 text-white text-sm font-bold rounded-full">
                            {getMotivationalMessage()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
              })}
            </div>
          ))}
        </div>
      )}

      {editingHabit && (
        <QuickHabitForm
          habits={habits}
          onSubmit={onUpdate}
          onClose={() => setEditingHabit(null)}
          editingHabit={editingHabit}
        />
      )}

      <Modal
        isOpen={skipModal.isOpen}
        onClose={() => {
          setSkipModal({ isOpen: false, habitId: null, dateStr: null })
          setSkipNote('')
        }}
        title="Why are you skipping?"
      >
        <div className="space-y-4">
          <textarea
            value={skipNote}
            onChange={(e) => setSkipNote(e.target.value)}
            placeholder="Add a note about why you're skipping this habit..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSkipModal({ isOpen: false, habitId: null, dateStr: null })
                setSkipNote('')
              }}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const habit = habits.find(h => h.id === skipModal.habitId)
                if (habit) {
                  const updatedHabit = {
                    ...habit,
                    skipNotes: {
                      ...habit.skipNotes,
                      [skipModal.dateStr]: skipNote
                    }
                  }
                  onUpdate(updatedHabit)
                }
                onToggle(skipModal.habitId, skipModal.dateStr)
                setSkipModal({ isOpen: false, habitId: null, dateStr: null })
                setSkipNote('')
              }}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
            >
              Skip Habit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
