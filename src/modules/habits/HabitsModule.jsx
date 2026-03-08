import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Target, TrendingUp, Calendar, Sparkles, BarChart3, Bell, FileText, Award, Link2 } from 'lucide-react'
import QuickHabitForm from './components/QuickHabitForm'
import HabitList from './components/HabitList'
import DailyHabitView from './components/DailyHabitView'
import HabitTemplates from './components/HabitTemplates'
import HabitAnalytics from './components/HabitAnalytics'
import HabitReminders from './components/HabitReminders'
import HabitScorecard from './components/HabitScorecard'
import HabitChainView from './components/HabitChainView'
import OnboardingHabitFlow from '../../components/OnboardingHabitFlow'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import Toast from '../../components/ui/Toast'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Tooltip from '../../components/ui/Tooltip'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useHabitLinkedList } from '../../hooks/useHabitLinkedList'
import { useToast } from '../../hooks/useToast'

export default function HabitsModule() {
  const [dbHabits, { addItem: addHabitToDb, updateItem: updateHabitInDb, deleteItem: deleteHabitFromDb, loading }] = useLocalStorage('habits', [])
  const { habits, removeHabit: removeFromList } = useHabitLinkedList(dbHabits)
  const [showQuickForm, setShowQuickForm] = useState(false)
  const { toast, showToast, hideToast } = useToast()
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [selectedHabits, setSelectedHabits] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [groupBy, setGroupBy] = useState('none')
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('habitViewMode') || 'today')
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const viewContainerRef = useRef(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [reminderHabit, setReminderHabit] = useState(null)
  const [habitNotes, { addItem: addNote }] = useLocalStorage('habitNotes', [])
  const [achievements, { addItem: addAchievement }] = useLocalStorage('achievements', [])
  const [metricsHistory, { addItem: addMetric, updateItem: updateMetric }] = useLocalStorage('habitMetricsHistory', [])
  const [scorecardHabits, setScorecardHabits] = useState(() => {
    const saved = localStorage.getItem('scorecardHabits')
    return saved ? JSON.parse(saved) : []
  })
  const [scorecardHabitData, setScorecardHabitData] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('hasCompletedOnboarding')
  })

  // View persistence
  useEffect(() => {
    localStorage.setItem('habitViewMode', viewMode)
  }, [viewMode])

  // Swipe gesture handling
  const minSwipeDistance = 50
  const views = ['today', 'weekly', 'chain', 'scorecard']

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = views.indexOf(viewMode)
      if (isLeftSwipe && currentIndex < views.length - 1) {
        setViewMode(views[currentIndex + 1])
      } else if (isRightSwipe && currentIndex > 0) {
        setViewMode(views[currentIndex - 1])
      }
    }
  }

  const handleMilestone = async (milestone, habit) => {
    await addAchievement({
      id: Date.now(),
      habitId: habit.id,
      habitName: habit.newHabit || habit.habit,
      milestone,
      date: new Date().toISOString()
    })
  }

  // Save scorecard to localStorage
  const saveScorecard = (habits) => {
    setScorecardHabits(habits)
    localStorage.setItem('scorecardHabits', JSON.stringify(habits))
    showToast('Scorecard saved!')
  }

  // Create habit from scorecard
  const createFromScorecard = (habitData) => {
    setScorecardHabitData(habitData)
    setShowQuickForm(true)
    setViewMode('today')
  }

  const today = new Date().toDateString()

  const getTodayMetrics = useMemo(() => {
    const todayHabits = habits.filter(h => {
      const habitStartDate = new Date(h.createdAt || h.id)
      const todayDate = new Date()
      habitStartDate.setHours(0, 0, 0, 0)
      todayDate.setHours(0, 0, 0, 0)
      if (todayDate < habitStartDate) return false
      const dayName = new Date().toLocaleDateString('en', { weekday: 'short' })
      const dateKey = new Date().toISOString().split('T')[0]
      const isScheduledByDay = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
      const isScheduledByDate = h.specificDates && h.specificDates.includes(dateKey)
      return isScheduledByDay || isScheduledByDate
    })
    const completed = todayHabits.filter(h => h.completions[today]).length
    const total = todayHabits.length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, rate }
  }, [habits, today])

  const getWeeklyMetrics = useMemo(() => {
    const weekDays = 7
    let totalScheduled = 0
    let totalCompleted = 0
    for (let i = 0; i < weekDays; i++) {
      const date = new Date()
      const dayOfWeek = date.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      date.setDate(date.getDate() + mondayOffset + i)
      const dateStr = date.toDateString()
      const dayName = date.toLocaleDateString('en', { weekday: 'short' })
      const dateKey = date.toISOString().split('T')[0]
      habits.forEach(h => {
        const habitStartDate = new Date(h.createdAt || h.id)
        const checkDate = new Date(date)
        habitStartDate.setHours(0, 0, 0, 0)
        checkDate.setHours(0, 0, 0, 0)
        if (checkDate < habitStartDate) return
        const isScheduledByDay = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
        const isScheduledByDate = h.specificDates && h.specificDates.includes(dateKey)
        if (isScheduledByDay || isScheduledByDate) {
          totalScheduled++
          if (h.completions[dateStr]) totalCompleted++
        }
      })
    }
    const rate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
    return { completed: totalCompleted, total: totalScheduled, rate }
  }, [habits])

  // Store daily metrics
  useEffect(() => {
    const todayKey = new Date().toISOString().split('T')[0]
    const existingMetric = metricsHistory.find(m => m.date === todayKey)
    const { completed, total, rate } = getTodayMetrics
    
    if (existingMetric) {
      if (existingMetric.completed !== completed || existingMetric.total !== total) {
        updateMetric({ ...existingMetric, completed, total, rate })
      }
    } else {
      addMetric({ date: todayKey, completed, total, rate })
    }
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentMetrics = metricsHistory.filter(m => new Date(m.date) >= thirtyDaysAgo)
    if (recentMetrics.length !== metricsHistory.length) {
      localStorage.setItem('habitMetricsHistory', JSON.stringify(recentMetrics))
    }
  }, [habits, getTodayMetrics])

  const getComparison = useMemo(() => {
    const todayKey = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().split('T')[0]
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoKey = weekAgo.toISOString().split('T')[0]
    
    const todayMetric = metricsHistory.find(m => m.date === todayKey) || getTodayMetrics
    const yesterdayMetric = metricsHistory.find(m => m.date === yesterdayKey)
    const weekAgoMetric = metricsHistory.find(m => m.date === weekAgoKey)
    
    // Total habits comparison
    const totalChange = weekAgoMetric ? todayMetric.total - weekAgoMetric.total : 0
    const totalText = totalChange > 0 ? `${totalChange} new this week` : totalChange < 0 ? `${Math.abs(totalChange)} removed` : 'Same as last week'
    const totalColor = totalChange > 0 ? 'text-green-600 dark:text-green-400' : totalChange < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
    
    // Completed today comparison
    const completedDiff = yesterdayMetric ? todayMetric.completed - yesterdayMetric.completed : 0
    const completedArrow = completedDiff > 0 ? '↑' : completedDiff < 0 ? '↓' : '→'
    const completedText = completedDiff !== 0 ? `${completedArrow} ${Math.abs(completedDiff)} ${completedDiff > 0 ? 'more' : 'less'} than yesterday` : 'Same as yesterday'
    const completedColor = completedDiff > 0 ? 'text-green-600 dark:text-green-400' : completedDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
    
    // Success rate comparison
    const rateDiff = weekAgoMetric ? todayMetric.rate - weekAgoMetric.rate : 0
    const rateArrow = rateDiff > 0 ? '↑' : rateDiff < 0 ? '↓' : '→'
    const bestWeek = metricsHistory.length > 0 ? Math.max(...metricsHistory.map(m => m.rate)) : 0
    const isBestWeek = todayMetric.rate >= bestWeek && todayMetric.rate >= 80
    const rateText = isBestWeek ? '🏆 Your best week!' : rateDiff !== 0 ? `${rateArrow} ${Math.abs(rateDiff)}% from last week` : 'Same as last week'
    const rateColor = isBestWeek ? 'text-yellow-600 dark:text-yellow-400' : rateDiff > 0 ? 'text-green-600 dark:text-green-400' : rateDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
    
    // Motivational context
    const isPerfectDay = todayMetric.total > 0 && todayMetric.completed === todayMetric.total
    const motivation = isPerfectDay ? '🎉 Perfect day!' : todayMetric.rate > 90 ? '⭐ Exceptional!' : todayMetric.rate > 80 ? '🔥 On fire!' : todayMetric.rate < 50 ? '💪 Keep pushing!' : ''
    
    return {
      total: { text: totalText, color: totalColor },
      completed: { text: completedText, color: completedColor },
      rate: { text: rateText, color: rateColor, motivation }
    }
  }, [metricsHistory, getTodayMetrics])

  const metrics = viewMode === 'today' ? getTodayMetrics : getWeeklyMetrics
  const completedToday = metrics.completed
  const totalHabits = metrics.total
  const completionRate = metrics.rate

  const applyTemplate = async (templateHabits) => {
    for (const habit of templateHabits) {
      await addHabit({ ...habit, id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, streak: 0, completions: {}, createdAt: new Date().toISOString(), schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] })
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    setShowTemplates(false)
    showToast('Template applied!')
  }

  const addHabitNote = async (habitId, note) => {
    await addNote({ id: Date.now(), habitId, note, date: new Date().toISOString() })
  }

  const addHabit = async (habit) => {
    try {
      if (habit.stackAfter) {
        const targetHabit = habits.find(h => h.id === habit.stackAfter)
        if (targetHabit) {
          habit.prevId = targetHabit.id
          habit.nextId = targetHabit.nextId || null
          habit.currentHabit = targetHabit.newHabit || targetHabit.habit
          habit.habitStatement = `After I ${habit.currentHabit}, I will ${habit.newHabit}`
          await addHabitToDb(habit)
          await updateHabitInDb({ ...targetHabit, nextId: habit.id })
          if (targetHabit.nextId) {
            const nextHabit = habits.find(h => h.id === targetHabit.nextId)
            if (nextHabit) {
              await updateHabitInDb({
                ...nextHabit,
                prevId: habit.id,
                currentHabit: habit.newHabit,
                stackAfter: habit.id,
                habitStatement: `After I ${habit.newHabit}, I will ${nextHabit.newHabit}`
              })
            }
          }
        } else {
          await addHabitToDb(habit)
        }
      } else {
        await addHabitToDb(habit)
      }
      showToast('Habit added successfully!')
    } catch (err) {
      showToast('Failed to add habit', 'error')
    }
  }

  const toggleHabit = async (id, dateKey) => {
    try {
      const habit = habits.find(h => h.id === id)
      if (!habit) return
      const dateStr = dateKey || today
      const checkinDate = new Date(dateStr)
      const createdDate = new Date(habit.createdAt || habit.id)
      checkinDate.setHours(0, 0, 0, 0)
      createdDate.setHours(0, 0, 0, 0)
      if (checkinDate < createdDate) return
      const newCompletions = { ...habit.completions, [dateStr]: !habit.completions[dateStr] }
      let streak = 0
      const toggleDate = new Date(dateStr)
      const habitCreatedDate = new Date(habit.createdAt || habit.id)
      for (let i = 0; i < 365; i++) {
        const date = new Date(toggleDate)
        date.setDate(date.getDate() - i)
        if (date < habitCreatedDate) break
        const checkDateStr = date.toDateString()
        if (newCompletions[checkDateStr]) streak++
        else break
      }
      await updateHabitInDb({ ...habit, completions: newCompletions, streak })
    } catch (err) {
      showToast('Failed to update habit', 'error')
    }
  }

  const deleteHabit = (id) => {
    const habit = habits.find(h => h.id === id)
    setHabitToDelete(habit)
    setShowDeleteConfirm(true)
  }

  const toggleHabitSelection = (id) => {
    const newSelected = new Set(selectedHabits)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedHabits(newSelected)
  }

  const deleteSelectedHabits = () => {
    setShowDeleteConfirm(true)
  }

  const selectAllHabits = () => {
    setSelectedHabits(new Set(habits.map(h => h.id)))
  }

  const clearSelection = () => {
    setSelectedHabits(new Set())
    setIsSelectionMode(false)
  }

  const confirmDelete = async () => {
    try {
      if (habitToDelete) {
        const result = removeFromList(habitToDelete.id)
        if (result) {
          if (result.next) await updateHabitInDb(result.next)
          if (result.prev) await updateHabitInDb(result.prev)
        }
        await deleteHabitFromDb(habitToDelete.id)
        showToast('Habit deleted!')
      } else if (selectedHabits.size > 0) {
        for (const id of selectedHabits) {
          await deleteHabitFromDb(id)
        }
        showToast(`${selectedHabits.size} habits deleted!`)
        clearSelection()
      }
    } catch (err) {
      showToast('Failed to delete', 'error')
    } finally {
      setShowDeleteConfirm(false)
      setHabitToDelete(null)
    }
  }

  const updateHabit = async (updatedHabit) => {
    try {
      const oldHabit = habits.find(h => h.id === updatedHabit.id)
      await updateHabitInDb(updatedHabit)
      if (oldHabit && oldHabit.newHabit !== updatedHabit.newHabit) {
        const dependentHabits = habits.filter(h => h.currentHabit === oldHabit.newHabit && h.id !== updatedHabit.id)
        for (const depHabit of dependentHabits) {
          await updateHabitInDb({ ...depHabit, currentHabit: updatedHabit.newHabit })
        }
      }
      showToast('Habit updated!')
    } catch (err) {
      showToast('Failed to update habit', 'error')
    }
  }

  const duplicateHabit = async (habit) => {
    try {
      const newId = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const duplicated = { ...habit }
      duplicated.id = newId
      duplicated.completions = {}
      duplicated.streak = 0
      duplicated.createdAt = new Date().toISOString()
      delete duplicated.prevId
      delete duplicated.nextId
      delete duplicated.stackAfter
      await addHabitToDb(duplicated)
      showToast('Habit duplicated!')
    } catch (err) {
      showToast('Failed to duplicate', 'error')
    }
  }

  if (loading) return <Loading text="Loading habits..." />

  if (showOnboarding) {
    return (
      <OnboardingHabitFlow
        onComplete={() => setShowOnboarding(false)}
        onAddHabit={addHabit}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Habits</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Build better habits daily</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Tooltip text="Track current habits as good/bad/neutral">
              <button onClick={() => setViewMode('scorecard')} className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl active:scale-95 flex items-center gap-2" aria-label="Open scorecard">
                <Award className="w-4 h-4" />Scorecard
              </button>
            </Tooltip>
            <Tooltip text="Use pre-built habit templates">
              <button onClick={() => setShowTemplates(true)} className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl active:scale-95 flex items-center gap-2" aria-label="Open templates">
                <Sparkles className="w-4 h-4" />Templates
              </button>
            </Tooltip>
            <Tooltip text="View habit analytics and insights">
              <button onClick={() => setShowAnalytics(true)} className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl active:scale-95 flex items-center gap-2" aria-label="Open analytics">
                <BarChart3 className="w-4 h-4" />Analytics
              </button>
            </Tooltip>
            {habits.length > 0 && (
              <>
                {isSelectionMode ? (
                  <>
                    <button onClick={selectAllHabits} className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl active:scale-95">Select All</button>
                    <button onClick={clearSelection} className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl active:scale-95">Cancel</button>
                    {selectedHabits.size > 0 && (
                      <button onClick={deleteSelectedHabits} className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl active:scale-95">Delete ({selectedHabits.size})</button>
                    )}
                  </>
                ) : (
                  <button onClick={() => setIsSelectionMode(true)} className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl active:scale-95">Select</button>
                )}
              </>
            )}
            <button onClick={() => setShowQuickForm(true)} className="flex-1 sm:flex-none min-h-[52px] px-5 sm:px-6 py-3 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95">
              <Plus className="w-5 h-5" />Add Habit
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">{totalHabits}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active Habits</p>
            <p className={`text-xs font-semibold mt-2 ${getComparison.total.color}`}>{getComparison.total.text}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Today</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">{completedToday}<span className="text-2xl sm:text-3xl text-gray-400">/{totalHabits}</span></h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed</p>
            <p className={`text-xs font-semibold mt-2 ${getComparison.completed.color}`}>{getComparison.completed.text}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Rate</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">{completionRate}%</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Success Rate</p>
            <div className="mt-2 space-y-1">
              <p className={`text-xs font-semibold ${getComparison.rate.color}`}>{getComparison.rate.text}</p>
              {getComparison.rate.motivation && (
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{getComparison.rate.motivation}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 -mx-4 px-4 py-3">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          <button 
            onClick={() => { setViewMode('today'); setCurrentDate(new Date()); }} 
            className={`flex-1 min-h-[48px] px-3 py-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${viewMode === 'today' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /><span className="hidden sm:inline">Today</span>
          </button>
          <button 
            onClick={() => setViewMode('weekly')} 
            className={`flex-1 min-h-[48px] px-3 py-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${viewMode === 'weekly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Target className="w-4 h-4 sm:w-5 sm:h-5" /><span className="hidden sm:inline">Weekly</span>
          </button>
          <button 
            onClick={() => setViewMode('chain')} 
            className={`flex-1 min-h-[48px] px-3 py-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${viewMode === 'chain' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Link2 className="w-4 h-4 sm:w-5 sm:h-5" /><span className="hidden sm:inline">Chain</span>
          </button>
          <button 
            onClick={() => setViewMode('scorecard')} 
            className={`flex-1 min-h-[48px] px-3 py-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${viewMode === 'scorecard' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5" /><span className="hidden sm:inline">Score</span>
          </button>
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {views.map((view, idx) => (
            <div 
              key={view}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${viewMode === view ? 'bg-indigo-600 w-6' : 'bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>
      </div>

      <div 
        ref={viewContainerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="transition-all duration-300 ease-out"
      >
        {viewMode === 'scorecard' ? (
          <HabitScorecard
            habits={scorecardHabits}
            onSave={saveScorecard}
            onCreateHabit={createFromScorecard}
          />
        ) : viewMode === 'chain' ? (
          <HabitChainView
            habits={habits}
            onToggle={toggleHabit}
            onAdd={(habitId) => {
              setShowQuickForm(true)
              // Pre-fill with stackAfter
              setTimeout(() => {
                const form = document.querySelector('[name="stackAfter"]')
                if (form) form.value = habitId
              }, 100)
            }}
          />
        ) : viewMode === 'today' ? (
          <DailyHabitView 
            habits={habits} 
            onToggle={toggleHabit} 
            onDelete={deleteHabit} 
            onUpdate={updateHabit} 
            onAdd={addHabit} 
            onDuplicate={duplicateHabit} 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            isSelectionMode={isSelectionMode} 
            selectedHabits={selectedHabits} 
            onToggleSelection={toggleHabitSelection}
            onMilestone={handleMilestone}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Weekly Focus</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Track your weekly progress</p>
                  </div>
                </div>
                <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="none">No Grouping</option>
                  <option value="identity">By Identity</option>
                  <option value="location">By Location</option>
                </select>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {habits.length === 0 ? (
                <EmptyState type="habits" onAction={() => setShowQuickForm(true)} actionLabel="Create Your First Habit" />
              ) : (
                <HabitList 
                  habits={habits} 
                  onToggle={toggleHabit} 
                  onDelete={deleteHabit} 
                  onUpdate={updateHabit} 
                  onDuplicate={duplicateHabit} 
                  groupBy={groupBy} 
                  isSelectionMode={isSelectionMode} 
                  selectedHabits={selectedHabits} 
                  onToggleSelection={toggleHabitSelection} 
                />
              )}
            </div>
          </div>
        )}
      </div>

      {showQuickForm && (
        <QuickHabitForm 
          habits={habits} 
          onSubmit={addHabit} 
          onClose={() => { 
            setShowQuickForm(false)
            setScorecardHabitData(null)
          }} 
          scorecardHabit={scorecardHabitData}
        />
      )}

      {showTemplates && (
        <HabitTemplates onApply={applyTemplate} onClose={() => setShowTemplates(false)} />
      )}

      {showAnalytics && (
        <HabitAnalytics habits={habits} onClose={() => setShowAnalytics(false)} />
      )}

      {reminderHabit && (
        <HabitReminders habit={reminderHabit} onSave={updateHabit} onClose={() => setReminderHabit(null)} />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setHabitToDelete(null); }}
        onConfirm={confirmDelete}
        title={`Delete Habit${selectedHabits.size > 1 ? 's' : ''}?`}
        message={
          habitToDelete 
            ? `Are you sure you want to delete "${habitToDelete.habit || habitToDelete.newHabit}"? This action cannot be undone.`
            : `Delete ${selectedHabits.size} selected habit${selectedHabits.size > 1 ? 's' : ''}? This action cannot be undone.`
        }
        confirmText="Delete"
        type="danger"
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
