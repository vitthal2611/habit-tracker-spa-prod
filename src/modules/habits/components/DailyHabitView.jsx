import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import QuickHabitForm from './QuickHabitForm'
import Modal from '../../../components/ui/Modal'
import PhaseProgressCard from './PhaseProgressCard'
import TemptationBundling from './TemptationBundling'
import MilestoneCelebration from './MilestoneCelebration'

export default function DailyHabitView({ habits, onToggle, onDelete, onUpdate, onAdd, onDuplicate, currentDate: propCurrentDate, setCurrentDate: propSetCurrentDate, isSelectionMode = false, selectedHabits = new Set(), onToggleSelection, onMilestone }) {
  const [currentDate, setCurrentDate] = useState(propCurrentDate || new Date())
  const [showAll, setShowAll] = useState(false)
  const [completedHabit, setCompletedHabit] = useState(null)
  const [editingHabit, setEditingHabit] = useState(null)
  const [groupBy, setGroupBy] = useState('none')
  const [skipModal, setSkipModal] = useState({ isOpen: false, habitId: null, dateStr: null, missedYesterday: false })
  const [skipNote, setSkipNote] = useState('')
  const [interventionModal, setInterventionModal] = useState({ isOpen: false, habit: null, dateStr: null })
  const [skipConfirmText, setSkipConfirmText] = useState('')
  const [celebration, setCelebration] = useState(null)
  const [streakAnimation, setStreakAnimation] = useState(null)
  const [swipeState, setSwipeState] = useState({})
  const [undoToast, setUndoToast] = useState(null)

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
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    setCompletedHabit(habitId)
    setTimeout(() => setCompletedHabit(null), 1000)
    onToggle(habitId, dateStr)

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50)

    // Show undo toast
    setUndoToast({ habitId, dateStr, action: 'complete' })
    setTimeout(() => setUndoToast(null), 3000)

    // Check for milestone
    const newStreak = (habit.streak || 0) + 1
    if ([7, 30, 100].includes(newStreak)) {
      setTimeout(() => {
        setCelebration({ milestone: newStreak, habitName: habit.newHabit || habit.habit })
        onMilestone && onMilestone(newStreak, habit)
      }, 500)
    }
  }

  const handleUndo = () => {
    if (undoToast) {
      onToggle(undoToast.habitId, undoToast.dateStr)
      setUndoToast(null)
    }
  }

  const handleTouchStart = (e, habitId) => {
    const touch = e.touches[0]
    setSwipeState(prev => ({
      ...prev,
      [habitId]: { startX: touch.clientX, currentX: touch.clientX, swiping: true }
    }))
  }

  const handleTouchMove = (e, habitId) => {
    if (!swipeState[habitId]?.swiping) return
    const touch = e.touches[0]
    setSwipeState(prev => ({
      ...prev,
      [habitId]: { ...prev[habitId], currentX: touch.clientX }
    }))
  }

  const handleTouchEnd = (habitId, dateStr, isCompleted) => {
    const state = swipeState[habitId]
    if (!state) return

    const deltaX = state.currentX - state.startX
    const threshold = window.innerWidth * 0.5

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && !isCompleted) {
        // Swipe right - complete
        handleComplete(habitId, dateStr)
      } else if (deltaX < 0 && !isCompleted) {
        // Swipe left - skip
        const habit = habits.find(h => h.id === habitId)
        handleSkipClick(habit, dateStr)
      }
    }

    setSwipeState(prev => ({ ...prev, [habitId]: null }))
  }

  const wasMissedYesterday = (habit) => {
    const yesterday = new Date(currentDate)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()
    return habit.completions && habit.completions[yesterdayStr] === false
  }

  const handleSkipClick = (habit, dateStr) => {
    setInterventionModal({ isOpen: true, habit, dateStr })
  }

  const handleDoTwoMinVersion = () => {
    handleComplete(interventionModal.habit.id, interventionModal.dateStr)
    setInterventionModal({ isOpen: false, habit: null, dateStr: null })
  }

  const handleProceedToSkip = () => {
    const missedYesterday = wasMissedYesterday(interventionModal.habit)
    setInterventionModal({ isOpen: false, habit: null, dateStr: null })
    setSkipModal({ 
      isOpen: true, 
      habitId: interventionModal.habit.id, 
      dateStr: interventionModal.dateStr,
      missedYesterday 
    })
  }

  const getMilestones = () => [7, 30, 100, 365]

  const getNextMilestone = (streak) => {
    const milestones = getMilestones()
    return milestones.find(m => m > streak) || null
  }

  const getMilestoneProgress = (streak) => {
    const next = getNextMilestone(streak)
    if (!next) return { current: streak, next: 365, remaining: 0, progress: 100, reward: 'Legend status 🏆' }
    
    const milestones = getMilestones()
    const prevMilestone = milestones.filter(m => m <= streak).pop() || 0
    const range = next - prevMilestone
    const progress = ((streak - prevMilestone) / range) * 100
    
    const rewards = {
      7: 'Red flame badge 🔥',
      30: 'Purple flame badge 🔥',
      100: 'Pink flame badge 🔥',
      365: 'Gold legend badge 🏆'
    }
    
    return {
      current: streak,
      next,
      remaining: next - streak,
      progress,
      reward: rewards[next]
    }
  }

  const getStreakColor = (streak) => {
    if (streak >= 100) return 'from-yellow-400 to-amber-500'
    if (streak >= 30) return 'from-purple-500 to-pink-500'
    if (streak >= 7) return 'from-red-500 to-orange-500'
    return 'from-orange-400 to-orange-500'
  }

  const getProgressBarColor = (streak) => {
    if (streak >= 100) return 'from-yellow-400 via-amber-400 to-yellow-500'
    if (streak >= 30) return 'from-purple-500 via-pink-500 to-purple-600'
    if (streak >= 7) return 'from-red-500 via-orange-500 to-red-600'
    return 'from-orange-400 via-red-400 to-orange-500'
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
          <button onClick={() => navigateDay(-1)} className="min-w-[52px] min-h-[52px] flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-md active:scale-95">
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="text-center flex-1 px-2">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatDate(currentDate)}</div>
            {currentDate.toDateString() === new Date().toDateString() && (
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>TODAY
              </span>
            )}
          </div>
          <button onClick={() => navigateDay(1)} className="min-w-[52px] min-h-[52px] flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-md active:scale-95">
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {totalScheduled.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white dark:bg-gray-900/50 rounded-xl p-4 sm:p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-1">{totalScheduled.length}</div>
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 sm:p-5 text-center shadow-lg">
              <div className="text-3xl sm:text-4xl font-black text-white mb-1">{completedToday}</div>
              <div className="text-sm font-bold text-white/90 uppercase tracking-wide">Done</div>
            </div>
            <div className="bg-white dark:bg-gray-900/50 rounded-xl p-4 sm:p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-3xl sm:text-4xl font-black text-orange-500 dark:text-orange-400 mb-1">{missedToday}</div>
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Skipped</div>
            </div>
          </div>
        )}

        {totalScheduled.length > 0 && (
          <div className="mt-4 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.round((completedToday / totalScheduled.length) * 100)}%</span>
            </div>
            <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500" style={{ width: `${(completedToday / totalScheduled.length) * 100}%` }}></div>
            </div>
          </div>
        )}

        {pendingToday === 0 && totalScheduled.length > 0 && (
          <button onClick={() => setShowAll(!showAll)} className="w-full mt-4 min-h-[48px] py-3 rounded-xl font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all active:scale-95">
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
              className={`min-h-[44px] px-5 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all active:scale-95 ${
                groupBy === 'none'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              No Grouping
            </button>
            <button
              onClick={() => setGroupBy('identity')}
              className={`min-h-[44px] px-5 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all active:scale-95 ${
                groupBy === 'identity'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
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
                  <div 
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
                      completedHabit === habit.id ? 'scale-[1.01] shadow-2xl' : ''
                    } ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700' : ''}`}
                    onTouchStart={(e) => !isCompleted && handleTouchStart(e, habit.id)}
                    onTouchMove={(e) => !isCompleted && handleTouchMove(e, habit.id)}
                    onTouchEnd={() => !isCompleted && handleTouchEnd(habit.id, dateStr, isCompleted)}
                    style={{
                      transform: swipeState[habit.id] ? `translateX(${swipeState[habit.id].currentX - swipeState[habit.id].startX}px)` : 'none',
                      transition: swipeState[habit.id]?.swiping ? 'none' : 'transform 0.3s ease-out'
                    }}
                  >
                    {/* Swipe Background */}
                    {swipeState[habit.id] && (() => {
                      const deltaX = swipeState[habit.id].currentX - swipeState[habit.id].startX
                      const isRight = deltaX > 0
                      return (
                        <div className={`absolute inset-0 flex items-center ${
                          isRight ? 'justify-start pl-8 bg-gradient-to-r from-green-500 to-emerald-600' : 'justify-end pr-8 bg-gradient-to-l from-red-500 to-orange-600'
                        }`}>
                          <span className="text-4xl text-white">{isRight ? '✓' : '✗'}</span>
                        </div>
                      )
                    })()}
                    
                    {/* Identity Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3 flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <span className="text-sm sm:text-lg font-bold text-white truncate">{habit.identity}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {habit.streak > 0 && (() => {
                          const milestoneData = getMilestoneProgress(habit.streak)
                          return (
                            <div className="relative group">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setStreakAnimation(habit.id)
                                  setTimeout(() => setStreakAnimation(null), 300)
                                }}
                                className={`bg-gradient-to-r ${getStreakColor(habit.streak)} text-white text-base sm:text-lg font-black px-3 sm:px-4 py-2 rounded-full shadow-lg transition-all active:scale-110 hover:shadow-xl ${
                                  streakAnimation === habit.id ? 'animate-bounce' : ''
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>🔥 {habit.streak}</span>
                                  {milestoneData.next && (
                                    <span className="text-xs opacity-90">→ {milestoneData.next}</span>
                                  )}
                                  {habit.streak >= 100 && <span className="text-sm">✨</span>}
                                </div>
                                {milestoneData.next && (
                                  <div className="mt-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full bg-gradient-to-r ${getProgressBarColor(habit.streak)} transition-all duration-500 group-hover:animate-pulse`}
                                      style={{ width: `${milestoneData.progress}%` }}
                                    />
                                  </div>
                                )}
                              </button>
                              {/* Tooltip */}
                              <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-gray-400">Current:</span>
                                    <span className="ml-2 font-bold">{milestoneData.current} days</span>
                                  </div>
                                  {milestoneData.next && (
                                    <>
                                      <div>
                                        <span className="text-gray-400">Next milestone:</span>
                                        <span className="ml-2 font-bold">{milestoneData.next} days</span>
                                        <span className="ml-1 text-yellow-400">({milestoneData.remaining} to go!)</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Reward:</span>
                                        <span className="ml-2">{milestoneData.reward}</span>
                                      </div>
                                    </>
                                  )}
                                  {!milestoneData.next && (
                                    <div className="text-yellow-400 font-bold">🏆 Legend Status Achieved!</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })()}
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
                        <div className="space-y-2">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (!isCompleted && currentDateOnly <= new Date().setHours(0,0,0,0)) {
                                handleComplete(habit.id, dateStr)
                              }
                            }}
                            disabled={isCompleted || currentDateOnly > new Date().setHours(0,0,0,0)}
                            className={`w-full min-h-[52px] py-3 rounded-xl font-bold text-base transition-all ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                                : currentDateOnly > new Date().setHours(0,0,0,0) 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg active:scale-95'
                            }`}
                          >
                            {isCompleted ? '✓ Completed' : '✓ Complete'}
                          </button>
                          {!isCompleted && !isMissed && currentDateOnly <= new Date().setHours(0,0,0,0) && (
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleSkipClick(habit, dateStr)
                              }}
                              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              Can't complete?
                            </button>
                          )}
                          {isMissed && (
                            <div className="text-center text-sm text-red-500 font-semibold">✗ Skipped</div>
                          )}
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
                        <div className="col-span-2 space-y-1">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (!isCompleted && currentDateOnly <= new Date().setHours(0,0,0,0)) {
                                handleComplete(habit.id, dateStr)
                              }
                            }}
                            disabled={isCompleted || currentDateOnly > new Date().setHours(0,0,0,0)}
                            className={`w-full min-h-[52px] py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                                : currentDateOnly > new Date().setHours(0,0,0,0) 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg active:scale-95'
                            }`}
                          >
                            {isCompleted ? '✓' : '✓'}
                          </button>
                          {!isCompleted && !isMissed && currentDateOnly <= new Date().setHours(0,0,0,0) && (
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleSkipClick(habit, dateStr)
                              }}
                              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              Can't complete?
                            </button>
                          )}
                          {isMissed && (
                            <div className="text-center text-xs text-red-500 font-semibold">✗ Skipped</div>
                          )}
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

                      {/* Milestone Progress Indicator */}
                      {habit.streak > 0 && (() => {
                        const milestoneData = getMilestoneProgress(habit.streak)
                        if (!milestoneData.next) return null
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setStreakAnimation(habit.id)
                              setTimeout(() => setStreakAnimation(null), 300)
                            }}
                            className="mt-3 w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-3 hover:shadow-md transition-all active:scale-[0.99]"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                Progress to next milestone
                              </span>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                {milestoneData.current}/{milestoneData.next} days
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${getProgressBarColor(habit.streak)} transition-all duration-500`}
                                style={{ width: `${milestoneData.progress}%` }}
                              />
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {milestoneData.remaining} days to go! 🎯
                            </div>
                          </button>
                        )
                      })()}

                      {/* Phase 2 Components */}
                      <div className="mt-4 space-y-3">
                        <PhaseProgressCard habit={habit} onUpdate={onUpdate} />
                        <TemptationBundling habit={habit} onUpdate={onUpdate} />
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

      {celebration && (
        <MilestoneCelebration
          milestone={celebration.milestone}
          habitName={celebration.habitName}
          onClose={() => setCelebration(null)}
          onShare={(milestone, habitName) => {
            // Share functionality
            if (navigator.share) {
              navigator.share({
                title: `${milestone} Day Streak!`,
                text: `I just hit a ${milestone}-day streak on "${habitName}"! 🔥`,
              }).catch(() => {})
            }
          }}
        />
      )}

      {/* Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
            <span className="font-semibold">Habit completed!</span>
            <button
              onClick={handleUndo}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={interventionModal.isOpen}
        onClose={() => {
          setInterventionModal({ isOpen: false, habit: null, dateStr: null })
        }}
        title="Before you skip..."
      >
        <div className="space-y-4">
          {interventionModal.habit?.twoMinVersion && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Can you do just:</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{interventionModal.habit.twoMinVersion}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {interventionModal.habit?.twoMinVersion && (
              <button
                onClick={handleDoTwoMinVersion}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                ✓ Do 2-Min Version
              </button>
            )}
            <button
              onClick={handleProceedToSkip}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Still Skip
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={skipModal.isOpen}
        onClose={() => {
          setSkipModal({ isOpen: false, habitId: null, dateStr: null, missedYesterday: false })
          setSkipNote('')
          setSkipConfirmText('')
        }}
        title="Why are you skipping?"
      >
        <div className="space-y-4">
          {skipModal.missedYesterday && (
            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-lg p-4">
              <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <span>⚠️</span>
                <span>You missed yesterday. Never miss twice! Even 2 minutes counts.</span>
              </p>
            </div>
          )}
          <textarea
            value={skipNote}
            onChange={(e) => setSkipNote(e.target.value)}
            placeholder="Add a note about why you're skipping this habit..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
          />
          {skipModal.missedYesterday && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Type "SKIP" to confirm:
              </label>
              <input
                type="text"
                value={skipConfirmText}
                onChange={(e) => setSkipConfirmText(e.target.value)}
                placeholder="SKIP"
                className="w-full px-4 py-3 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSkipModal({ isOpen: false, habitId: null, dateStr: null, missedYesterday: false })
                setSkipNote('')
                setSkipConfirmText('')
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
                setSkipModal({ isOpen: false, habitId: null, dateStr: null, missedYesterday: false })
                setSkipNote('')
                setSkipConfirmText('')
              }}
              disabled={skipModal.missedYesterday && skipConfirmText !== 'SKIP'}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                skipModal.missedYesterday
                  ? skipConfirmText === 'SKIP'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {skipModal.missedYesterday ? '⚠️ Skip Anyway' : 'Skip Habit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
