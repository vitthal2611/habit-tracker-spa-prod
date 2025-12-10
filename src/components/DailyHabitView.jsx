import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Clock, MapPin, Zap, Eye, Gift } from 'lucide-react'
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

  const dateStr = useMemo(() => currentDate.toDateString(), [currentDate])
  
  const dayHabits = useMemo(() => {
    const filtered = getDayHabits()
    return sortByTime(filtered)
  }, [habits, currentDate, showAll])

  const totalScheduled = useMemo(() => {
    const currentDateOnly = new Date(currentDate)
    currentDateOnly.setHours(0, 0, 0, 0)
    const dayName = currentDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = currentDate.toISOString().split('T')[0]
    
    return habits.filter(h => {
      const habitStartDate = new Date(h.createdAt || h.id)
      if (isNaN(habitStartDate.getTime())) return false
      habitStartDate.setHours(0, 0, 0, 0)
      
      if (currentDateOnly < habitStartDate) return false
      
      const isScheduledByDay = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
      const isScheduledByDate = h.specificDates && h.specificDates.includes(dateKey)
      return isScheduledByDay || isScheduledByDate
    })
  }, [habits, currentDate])
  
  const { completedToday, missedToday, pendingToday } = useMemo(() => {
    const completed = totalScheduled.filter(h => h.completions && h.completions[dateStr] === true).length
    const missed = totalScheduled.filter(h => h.completions && h.completions[dateStr] === false).length
    const pending = totalScheduled.length - completed - missed
    return { completedToday: completed, missedToday: missed, pendingToday: pending }
  }, [totalScheduled, dateStr])

  const getWeekDates = () => {
    const dates = []
    const current = new Date(currentDate)
    const dayOfWeek = current.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    current.setDate(current.getDate() + mondayOffset)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(current)
      date.setDate(current.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = useMemo(() => getWeekDates(), [currentDate])

  const weekHabits = useMemo(() => {
    const habitMap = new Map()
    
    weekDates.forEach(date => {
      const dayName = date.toLocaleDateString('en', { weekday: 'short' })
      const dateKey = date.toISOString().split('T')[0]
      
      habits.forEach(habit => {
        const habitStartDate = new Date(habit.createdAt || habit.id)
        if (isNaN(habitStartDate.getTime())) return
        const checkDate = new Date(date)
        habitStartDate.setHours(0, 0, 0, 0)
        checkDate.setHours(0, 0, 0, 0)
        
        if (checkDate < habitStartDate) return
        
        const isScheduledByDay = !habit.schedule || habit.schedule.length === 0 || habit.schedule.includes(dayName)
        const isScheduledByDate = habit.specificDates && habit.specificDates.includes(dateKey)
        
        if (isScheduledByDay || isScheduledByDate) {
          if (!habitMap.has(habit.id)) {
            habitMap.set(habit.id, habit)
          }
        }
      })
    })
    
    return sortByTime(Array.from(habitMap.values()))
  }, [habits, weekDates])

  const [viewFormat, setViewFormat] = useState('cards')

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4">
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
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 sm:p-5 text-center shadow-lg">
              <div className="text-2xl sm:text-4xl font-black text-white mb-1">{completedToday}</div>
              <div className="text-xs font-bold text-white/90 uppercase tracking-wide">Done</div>
            </div>
            <div className="bg-white dark:bg-gray-900/50 rounded-xl p-3 sm:p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl sm:text-4xl font-black text-orange-500 dark:text-orange-400 mb-1">{missedToday}</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Skipped</div>
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
          <button onClick={() => setShowAll(!showAll)} className="w-full mt-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all shadow-md">
            {showAll ? 'Hide Completed' : 'Show All Habits'}
          </button>
        )}
      </div>

      {/* View Format Toggle */}
      {dayHabits.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewFormat('cards')}
              className={`px-4 sm:px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                viewFormat === 'cards'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewFormat('table')}
              className={`px-4 sm:px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                viewFormat === 'table'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Weekly Table
            </button>
          </div>
        </div>
      )}

      {viewFormat === 'table' ? (
        /* Weekly Table View */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full" style={{minWidth: '1400px'}}>
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">After</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap sticky left-0 bg-indigo-600 z-10">Habit</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Time</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Location</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Identity</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">2-Min</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Cue</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Reward</th>
                {weekDates.map((date, idx) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  return (
                    <th key={idx} className={`px-3 py-3 text-center text-xs font-bold text-white uppercase min-w-[70px] ${
                      isToday ? 'bg-yellow-500' : ''
                    }`}>
                      <div>{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                      <div className="text-[10px] font-normal">{date.getDate()}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {weekHabits.map((habit, idx) => {
                const habitStartDate = new Date(habit.createdAt || habit.id)
                habitStartDate.setHours(0, 0, 0, 0)
                
                return (
                  <tr key={habit.id} className={`${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors`}>
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={habit.currentHabit}>{habit.currentHabit || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white sticky left-0 bg-inherit z-10 max-w-[200px] truncate" title={habit.newHabit}>{habit.newHabit}</td>
                    <td className="px-3 py-3 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{habit.time || '-'}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[120px] truncate" title={habit.location}>{habit.location || '-'}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[120px] truncate" title={habit.identity}>{habit.identity || '-'}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={habit.twoMinVersion}>{habit.twoMinVersion || '-'}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[120px] truncate" title={habit.cue}>{habit.cue || '-'}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[120px] truncate" title={habit.reward}>{habit.reward || '-'}</td>
                    {weekDates.map((date, dateIdx) => {
                      const checkDate = new Date(date)
                      checkDate.setHours(0, 0, 0, 0)
                      const dateStr = date.toDateString()
                      const dayName = date.toLocaleDateString('en', { weekday: 'short' })
                      const dateKey = date.toISOString().split('T')[0]
                      
                      const isScheduledByDay = !habit.schedule || habit.schedule.length === 0 || habit.schedule.includes(dayName)
                      const isScheduledByDate = habit.specificDates && habit.specificDates.includes(dateKey)
                      const isScheduled = isScheduledByDay || isScheduledByDate
                      const isBeforeStart = checkDate < habitStartDate
                      const isFuture = checkDate > new Date().setHours(0, 0, 0, 0)
                      const isCompleted = habit.completions && habit.completions[dateStr] === true
                      const isMissed = habit.completions && habit.completions[dateStr] === false
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <td key={dateIdx} className={`px-2 py-3 text-center ${
                          isToday ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                        }`}>
                          {!isScheduled || isBeforeStart ? (
                            <div className="text-gray-300 dark:text-gray-700 text-xs">-</div>
                          ) : isFuture ? (
                            <div className="w-7 h-7 mx-auto rounded-lg bg-gray-100 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600"></div>
                          ) : (
                            <button
                              onClick={() => !isFuture && onToggle(habit.id, dateStr)}
                              disabled={isFuture}
                              className={`w-7 h-7 mx-auto rounded-lg font-bold text-xs transition-all active:scale-95 ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                                  : isMissed
                                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-indigo-500 hover:text-white'
                              }`}
                            >
                              {isCompleted ? '✓' : isMissed ? '✗' : ''}
                            </button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {weekHabits.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No habits scheduled for this week
            </div>
          )}
        </div>
      ) : dayHabits.length === 0 ? (
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
          {(() => {
            const morning = dayHabits.filter(h => {
              if (!h.time) return false
              const hour = parseInt(h.time.split(':')[0])
              return hour >= 5 && hour < 12
            })
            const afternoon = dayHabits.filter(h => {
              if (!h.time) return false
              const hour = parseInt(h.time.split(':')[0])
              return hour >= 12 && hour < 17
            })
            const evening = dayHabits.filter(h => {
              if (!h.time) return false
              const hour = parseInt(h.time.split(':')[0])
              return hour >= 17 && hour < 24
            })
            const night = dayHabits.filter(h => {
              if (!h.time) return false
              const hour = parseInt(h.time.split(':')[0])
              return hour >= 0 && hour < 5
            })
            const anytime = dayHabits.filter(h => !h.time || h.time === 'Anytime')

            const sections = [
              { title: '🌅 Morning', subtitle: '5:00 AM - 11:59 AM', habits: morning, color: 'from-amber-500 to-orange-500' },
              { title: '☀️ Afternoon', subtitle: '12:00 PM - 4:59 PM', habits: afternoon, color: 'from-blue-500 to-cyan-500' },
              { title: '🌆 Evening', subtitle: '5:00 PM - 11:59 PM', habits: evening, color: 'from-purple-500 to-pink-500' },
              { title: '🌙 Night', subtitle: '12:00 AM - 4:59 AM', habits: night, color: 'from-indigo-600 to-purple-600' },
              { title: '⏰ Anytime', subtitle: 'Flexible timing', habits: anytime, color: 'from-gray-500 to-gray-600' }
            ]

            return sections.map(section => {
              if (section.habits.length === 0) return null
              return (
                <div key={section.title}>
                  <div className="relative mb-4">
                    <div className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-10 rounded-xl blur-xl`}></div>
                    <div className={`relative bg-gradient-to-r ${section.color} rounded-xl p-3 shadow-lg`}>
                      <div className="flex items-center justify-between text-white">
                        <h3 className="text-base font-bold">{section.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-90">{section.subtitle}</span>
                          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">{section.habits.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {section.habits.map((habit) => {
            const isCompleted = habit.completions && habit.completions[dateStr] === true
            const isMissed = habit.completions && habit.completions[dateStr] === false
            const isPending = !isCompleted && !isMissed
            
            const habitStartDate = new Date(habit.createdAt || habit.id)
            const currentDateOnly = new Date(currentDate)
            habitStartDate.setHours(0, 0, 0, 0)
            currentDateOnly.setHours(0, 0, 0, 0)
            const isFuture = currentDateOnly > new Date().setHours(0,0,0,0)
            
            const getWeekDays = () => {
              const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
              const today = new Date(dateStr)
              const dayOfWeek = today.getDay()
              const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
              
              return days.map((day, i) => {
                const d = new Date(today)
                d.setDate(today.getDate() + mondayOffset + i)
                const status = habit.completions?.[d.toDateString()]
                return { day, completed: status === true, date: d.toDateString() }
              })
            }
            
            return (
              <div key={habit.id} className="group animate-fade-in">
                <div className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] bg-white border border-gray-200 shadow-lg ${
                  isCompleted ? 'ring-4 ring-green-400 ring-opacity-50' : 
                  isMissed ? 'ring-4 ring-orange-400 ring-opacity-50' : ''
                } ${
                  completedHabit === habit.id ? 'scale-[1.03] shadow-2xl ring-4 ring-indigo-500/40' : ''
                }`}>
                  
                  {/* Header - Identity */}
                  <div className="px-5 py-3 flex items-center justify-between bg-gray-50 border-b border-gray-200">
                    <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">{habit.identity || 'My Identity'}</span>
                    <div className="flex gap-2">
                      {!isSelectionMode && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); setEditingHabit(habit); }} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Combined Block - 30/70 ratio */}
                    <div className="rounded-2xl overflow-hidden shadow-lg flex">
                      <div className="w-[30%] bg-blue-50 p-4 border-l-4 border-blue-400">
                        <div className="text-xs font-bold uppercase tracking-wide text-gray-700 opacity-60 mb-1">After</div>
                        <div className="text-gray-700 text-sm">{habit.currentHabit || 'Previous habit'}</div>
                      </div>
                      <div className="w-[70%] bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center">
                        <div className="text-white font-black text-xl leading-tight">
                          I will {habit.newHabit}<br />{habit.time && <>at {habit.time}</>}{habit.location && <> in {habit.location}</>}
                        </div>
                      </div>
                    </div>

                    {/* Supporting Actions Checklist */}
                    {(habit.twoMinVersion || habit.cue || habit.reward) && (
                      <div className="space-y-2">
                        {habit.twoMinVersion && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                            <Zap className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                            <div>
                              <div className="text-xs font-bold text-yellow-900 uppercase tracking-wide">2-Min Version</div>
                              <div className="text-sm text-gray-700 mt-1">{habit.twoMinVersion}</div>
                            </div>
                          </div>
                        )}
                        {habit.cue && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <Eye className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                              <div className="text-xs font-bold text-blue-900 uppercase tracking-wide">Cue</div>
                              <div className="text-sm text-gray-700 mt-1">{habit.cue}</div>
                            </div>
                          </div>
                        )}
                        {habit.reward && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-pink-50 border border-pink-200">
                            <Gift className="w-4 h-4 text-pink-600 flex-shrink-0 mt-1" />
                            <div>
                              <div className="text-xs font-bold text-pink-900 uppercase tracking-wide">Reward</div>
                              <div className="text-sm text-gray-700 mt-1">{habit.reward}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Day Selector - Mon to Sun */}
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                        This Week
                      </div>
                      <div className="flex gap-2">
                        {getWeekDays().map((d, i) => (
                          <div
                            key={i}
                            className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                              d.completed ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {d.completed ? '✓' : d.day}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isPending && !isFuture && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleComplete(habit.id, dateStr)}
                          className="flex-1 py-3 rounded-xl font-bold uppercase tracking-wide transition-all active:scale-95 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => setSkipModal({ isOpen: true, habitId: habit.id, dateStr })}
                          className="px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all active:scale-95 bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                          Skip
                        </button>
                      </div>
                    )}

                    {/* Status Badge */}
                    {isCompleted && (
                      <div className="text-center py-2 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-green-700 font-bold text-sm">✓ Completed</span>
                      </div>
                    )}
                    {isMissed && (
                      <div className="text-center py-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <span className="text-orange-700 font-bold text-sm">Skipped</span>
                        {habit.skipNotes?.[dateStr] && (
                          <div className="mt-2 text-xs text-orange-600">{habit.skipNotes[dateStr]}</div>
                        )}
                      </div>
                    )}
                    {completedHabit === habit.id && (
                      <div className="text-center py-2 bg-indigo-50 border border-indigo-200 rounded-lg animate-fade-in">
                        <span className="text-indigo-700 font-bold text-sm">🎉 {getMotivationalMessage()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
                    })}
                  </div>
                </div>
              )
            })
          })()}
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
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
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
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              Skip Habit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
