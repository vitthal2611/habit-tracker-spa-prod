import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Navigation from './components/Navigation'
import HabitForm from './components/HabitForm'
import HabitList from './components/HabitList'
import TaskView from './components/TaskView'
import DailyHabitView from './components/DailyHabitView'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Modal from './components/ui/Modal'
import Auth from './components/Auth'
import { useFirestore } from './hooks/useFirestore'
import { generateTestHabits } from './utils/testHabits'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [habits, { addItem: addHabitToDb, updateItem: updateHabitInDb, deleteItem: deleteHabitFromDb, loading }] = useFirestore('habits', [])
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [showActionAlert, setShowActionAlert] = useState(false)
  const [alertHabits, setAlertHabits] = useState([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationHabit, setCelebrationHabit] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [groupBy, setGroupBy] = useState('none')
  const [checkinDate, setCheckinDate] = useState(new Date())
  const [showCompleted, setShowCompleted] = useState(false)
  const [viewMode, setViewMode] = useState('today') // 'today' or 'weekly'

  const today = new Date().toDateString()
  
  // Calculate metrics based on view mode
  const getTodayMetrics = () => {
    const todayHabits = habits.filter(h => {
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
  }
  
  const getWeeklyMetrics = () => {
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
  }
  
  const metrics = viewMode === 'today' ? getTodayMetrics() : getWeeklyMetrics()
  const completedToday = metrics.completed
  const totalHabits = metrics.total
  const completionRate = metrics.rate

  const addHabit = async (habit) => {
    await addHabitToDb(habit)
  }

  const loadTestHabits = async () => {
    const testHabits = generateTestHabits()
    for (const habit of testHabits) {
      await addHabitToDb(habit)
    }
  }

  const toggleHabit = async (id, dateKey = today) => {
    const habit = habits.find(h => h.id === id)
    if (habit) {
      const checkinDate = new Date(dateKey)
      const createdDate = new Date(habit.createdAt || habit.id)
      
      // Create new dates for comparison without modifying originals
      const checkinDateOnly = new Date(checkinDate)
      const createdDateOnly = new Date(createdDate)
      checkinDateOnly.setHours(0, 0, 0, 0)
      createdDateOnly.setHours(0, 0, 0, 0)
      
      if (checkinDateOnly < createdDateOnly) {
        return // Don't allow check-in before creation date
      }
      const newCompletions = { ...habit.completions, [dateKey]: !habit.completions[dateKey] }
      let streak = 0
      
      const toggleDate = new Date(dateKey)
      const habitCreatedDate = new Date(habit.createdAt || habit.id)
      
      for (let i = 0; i >= 0; i++) {
        const date = new Date(toggleDate)
        date.setDate(date.getDate() - i)
        
        if (date < habitCreatedDate) break
        
        const dateStr = date.toDateString()
        if (newCompletions[dateStr]) streak++
        else break
      }
      
      await updateHabitInDb({ ...habit, completions: newCompletions, streak })
    }
  }

  const deleteHabit = (id) => {
    const habit = habits.find(h => h.id === id)
    setHabitToDelete(habit)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (habitToDelete) {
      await deleteHabitFromDb(habitToDelete.id)
      setShowDeleteConfirm(false)
      setHabitToDelete(null)
    } else {
      // Delete all habits
      for (const habit of habits) {
        await deleteHabitFromDb(habit.id)
      }
      setShowDeleteConfirm(false)
    }
  }

  const updateHabit = async (updatedHabit) => {
    await updateHabitInDb(updatedHabit)
  }
  
  const handleEditHabit = (habit) => {
    setEditingHabit(habit)
    setShowForm(true)
  }
  
  const handleFormSubmit = async (habitData) => {
    if (editingHabit) {
      await updateHabit(habitData)
      setEditingHabit(null)
    } else {
      await addHabit(habitData)
    }
    setShowForm(false)
  }

  const checkMissedHabits = () => {
    const today = new Date()
    
    const missedHabits = habits.filter(habit => {
      const habitCreated = new Date(habit.createdAt || habit.id)
      habitCreated.setHours(0, 0, 0, 0)
      
      const threeDaysAfterCreation = new Date(habitCreated)
      threeDaysAfterCreation.setDate(threeDaysAfterCreation.getDate() + 3)
      
      // Only check habits that are at least 3 days old from creation
      if (today < threeDaysAfterCreation) return false
      
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const dayBeforeYesterday = new Date(today)
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
      
      const yesterdayStr = yesterday.toDateString()
      const dayBeforeStr = dayBeforeYesterday.toDateString()
      
      const missedYesterday = !habit.completions || !habit.completions[yesterdayStr]
      const missedDayBefore = !habit.completions || !habit.completions[dayBeforeStr]
      
      return missedYesterday && missedDayBefore
    })
    
    if (missedHabits.length > 0 && missedHabits.length <= 10) {
      setAlertHabits(missedHabits)
      setShowActionAlert(true)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (habits.length > 0) {
  //       checkMissedHabits()
  //     }
  //   }, 1000)
  //   return () => clearTimeout(timer)
  // }, [habits])

  const handleLogout = async () => {
    await signOut(auth)
  }

  const getProgressData = (period) => {
    const data = []
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      const completed = habits.filter(h => h.completions[dateStr]).length
      data.push({
        date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        completed,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0
      })
    }
    return data
  }

  const renderHome = () => {
    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
    return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome to Your Habit Tracker</h2>
        <p className="text-gray-600 dark:text-gray-400">Build better habits, one day at a time</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div className="p-4">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-blue-600">{totalHabits}</h3>
            <p className="text-gray-600 dark:text-gray-400">Total Habits</p>
          </div>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div className="p-4">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-600">{completedToday}/{totalHabits}</h3>
            <p className="text-gray-600 dark:text-gray-400">Completed Today</p>
            {completedToday === totalHabits && totalHabits > 0 && (
              <div className="text-xs text-green-600 font-medium mt-1">✨ Perfect Day!</div>
            )}
          </div>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div className="p-4">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-purple-600">{completionRate}%</h3>
            <p className="text-gray-600 dark:text-gray-400">Completion Rate</p>
            {completionRate >= 80 && (
              <div className="text-xs text-purple-600 font-medium mt-1">🔥 On Fire!</div>
            )}
          </div>
        </Card>
      </div>
      
      {totalHabits === 0 ? (
        <Card className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Start building better habits today</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Create Your First Habit
            </Button>
          </div>
        </Card>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Weekly Habits</h3>
            <div className="flex gap-2">
              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="none">No Grouping</option>
                <option value="identity">Group by Identity</option>
                <option value="location">Group by Location</option>
              </select>
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />Add Habit
              </Button>
            </div>
          </div>
          <HabitList habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} onUpdate={updateHabit} onEdit={handleEditHabit} groupBy={groupBy} />
        </div>
      )}
    </div>
  )
  }

  const renderHabits = () => {
    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
    return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Habits</h2>
        <div className="flex gap-2">
          <select 
            value={groupBy} 
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="none">No Grouping</option>
            <option value="identity">Group by Identity</option>
            <option value="location">Group by Location</option>
          </select>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />Add Habit
          </Button>
        </div>
      </div>
      
      {habits.length === 0 ? (
        <Card className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first habit to get started</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Create Habit
            </Button>
          </div>
        </Card>
      ) : (
        <HabitList habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} onUpdate={updateHabit} onEdit={handleEditHabit} groupBy={groupBy} />
      )}
    </div>
  )
  }



  const renderDailyHabits = () => {
    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
    return (
      <div className="animate-fade-in">
        <DailyHabitView habits={habits} onToggle={toggleHabit} />
      </div>
    )
  }

  const renderCheckin = () => {
    const checkinDateStr = checkinDate.toDateString()
    const dayName = checkinDate.toLocaleDateString('en', { weekday: 'short' })
    const isToday = checkinDateStr === today
    
    const allDayHabits = habits.filter(h => {
      const dateKey = checkinDate.toISOString().split('T')[0]
      const isScheduledByDay = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
      const isScheduledByDate = h.specificDates && h.specificDates.includes(dateKey)
      return isScheduledByDay || isScheduledByDate
    })
    
    const sortByTime = (habits) => {
      return habits.sort((a, b) => {
        const timeA = a.time || 'ZZ:ZZ'
        const timeB = b.time || 'ZZ:ZZ'
        if (timeA === 'Anytime') return 1
        if (timeB === 'Anytime') return -1
        return timeA.localeCompare(timeB)
      })
    }
    
    const dayHabits = showCompleted 
      ? sortByTime(allDayHabits)
      : sortByTime(allDayHabits.filter(h => !h.completions[checkinDateStr]))
    
    const completedCount = allDayHabits.filter(h => h.completions[checkinDateStr]).length
    const totalCount = allDayHabits.length
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
    
    const navigateDay = (direction) => {
      const newDate = new Date(checkinDate)
      newDate.setDate(newDate.getDate() + direction)
      setCheckinDate(newDate)
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -m-8 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-3xl opacity-10 blur-3xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="text-5xl mb-4">{progressPercent === 100 && totalCount > 0 ? '🎉' : isToday ? '✨' : '📅'}</div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">Daily Check-in</h1>
              
              {/* Date Navigation */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button 
                  onClick={() => navigateDay(-1)}
                  className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                >
                  ←
                </button>
                
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {checkinDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  {isToday ? (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium rounded-full mt-1">Today</span>
                  ) : (
                    <button 
                      onClick={() => setCheckinDate(new Date())}
                      className="inline-block px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-medium rounded-full mt-1 hover:shadow-md transition-all"
                    >
                      Go to Today
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => navigateDay(1)}
                  className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                >
                  →
                </button>
              </div>
              
              {/* Progress Circle */}
              <div className="flex items-center justify-center space-x-6 mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="url(#gradient)" strokeWidth="6" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${progressPercent * 2.51} 251`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{Math.round(progressPercent)}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedCount}/{totalCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                  {totalCount > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {completedCount === totalCount ? '🔥 Perfect!' : `${totalCount - completedCount} remaining`}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Toggle Button */}
              {totalCount > 0 && (
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    showCompleted 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {showCompleted ? 'Hide Completed' : 'Show All'}
                </button>
              )}
            </div>
          </div>

          {/* Habits List */}
          {totalCount === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">No habits for today</h3>
                <p className="text-gray-600 dark:text-gray-400">Enjoy your day off or add some habits!</p>
              </div>
            </div>
          ) : dayHabits.length === 0 && !showCompleted ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-green-200/50">
                <div className="text-6xl mb-4 animate-pulse">🎉</div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">All Done!</h3>
                <p className="text-gray-700 dark:text-gray-300">Amazing work! You've completed all your habits for today.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dayHabits.map((habit, index) => {
                const isCompleted = habit.completions[checkinDateStr]
                return (
                  <div key={habit.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all border-2 ${
                      isCompleted 
                        ? 'border-green-300 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleHabit(habit.id, checkinDateStr)}
                          className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all transform hover:scale-110 ${
                            isCompleted
                              ? 'bg-green-500 border-green-500 text-white shadow-lg'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {isCompleted && <span className="text-lg">✓</span>}
                        </button>
                        
                        <div className="flex-1">
                          <div className={`font-medium ${
                            isCompleted 
                              ? 'text-gray-600 dark:text-gray-400 line-through' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {habit.habit || habit.newHabit || 'Untitled Habit'}
                          </div>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {habit.time && (
                              <span className="flex items-center space-x-1">
                                <span>🕐</span>
                                <span>{habit.time}</span>
                              </span>
                            )}
                            {habit.location && (
                              <span className="flex items-center space-x-1">
                                <span>📍</span>
                                <span>{habit.location}</span>
                              </span>
                            )}
                            {habit.identity && (
                              <span className="flex items-center space-x-1">
                                <span>👤</span>
                                <span>{habit.identity}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {isCompleted && (
                          <div className="text-green-500 text-2xl animate-pulse">
                            ✨
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderDashboard = () => {
    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
    
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            {habits.length === 0 && (
              <Button onClick={loadTestHabits} variant="secondary" size="md">
                Load Test Habits
              </Button>
            )}
            <Button onClick={() => setShowForm(true)} size="md" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex-1 sm:flex-none">
              <Plus className="w-5 h-5 mr-2" /><span className="hidden sm:inline">Add Habit</span><span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Hero Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-10 h-10 sm:w-12 sm:h-12 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-full">Total</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-bold mb-2">{totalHabits}</h3>
            <p className="text-base sm:text-lg text-blue-100 font-medium">Active Habits</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-full">Today</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-bold mb-2">{completedToday}/{totalHabits}</h3>
            <p className="text-base sm:text-lg text-green-100 font-medium">Completed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-full">Rate</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-bold mb-2">{completionRate}%</h3>
            <p className="text-base sm:text-lg text-purple-100 font-medium">Success Rate</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-xl border-2 border-gray-200 dark:border-gray-700 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('today')}
              className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-base font-bold transition-all min-h-[52px] ${
                viewMode === 'today'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              <span className="hidden sm:inline">Today's Focus</span><span className="sm:hidden">Today</span>
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-base font-bold transition-all min-h-[52px] ${
                viewMode === 'weekly'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Target className="w-5 h-5 inline mr-2" />
              <span className="hidden sm:inline">Weekly Focus</span><span className="sm:hidden">Weekly</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'today' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 sm:p-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Today's Focus
              </h2>
            </div>
            <div className="p-3 sm:p-4">
              <DailyHabitView habits={habits} onToggle={toggleHabit} />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  Weekly Focus
                </h2>
                <select 
                  value={groupBy} 
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full sm:w-auto px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-0 rounded-lg bg-white/20 text-white backdrop-blur-sm"
                >
                  <option value="none" className="text-gray-900">No Grouping</option>
                  <option value="identity" className="text-gray-900">By Identity</option>
                  <option value="location" className="text-gray-900">By Location</option>
                </select>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              {habits.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No habits yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start building better habits today</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />Create Your First Habit
                  </Button>
                </div>
              ) : (
                <HabitList habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} onUpdate={updateHabit} onEdit={handleEditHabit} groupBy={groupBy} />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    return renderDashboard()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        {renderContent()}
      </main>
      <HabitForm 
        isOpen={showForm} 
        onClose={() => {
          setShowForm(false)
          setEditingHabit(null)
        }} 
        onSubmit={handleFormSubmit}
        habits={habits}
        editingHabit={editingHabit}
      />
      
      {showActionAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg animate-scale-in max-h-screen overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">⚠️</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Don't Break the Chain!</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">You've missed these habits for 2 days. Let's get back on track!</p>
            </div>
            
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {alertHabits.map(habit => (
                <div key={habit.id} className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900 rounded-xl border-l-4 border-orange-400">
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{habit.habit || habit.newHabit}</div>
                  <div className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">Identity: {habit.identity || 'Not set'}</div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center">
                <span className="text-lg sm:text-xl mr-2">🚀</span>
                Quick Recovery Plan
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2 sm:mr-3 flex-shrink-0">1</span>
                  <span>Start with just 2 minutes today</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-2 sm:mr-3 flex-shrink-0">2</span>
                  <span>Focus on showing up, not perfection</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs mr-2 sm:mr-3 flex-shrink-0">3</span>
                  <span>Never miss twice in a row</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={() => setShowActionAlert(false)}
                className="w-full px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-green-600 transition-all text-sm sm:text-base"
              >
                Let's Do This! 💪
              </button>
              <button 
                onClick={() => setShowActionAlert(false)}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showCelebration && celebrationHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center animate-scale-in">
            <div className="text-4xl sm:text-6xl mb-4">🎉</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Awesome!</h3>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-1">
              You're becoming {celebrationHabit.identity ? `a ${celebrationHabit.identity.toLowerCase()}` : 'better'}!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Every {celebrationHabit.habit || celebrationHabit.newHabit} builds your identity.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => setShowCelebration(false)}
                className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Keep Going! ✨
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{habitToDelete ? 'Delete Habit?' : 'Delete All Habits?'}</h3>
              {habitToDelete ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Are you sure you want to delete:</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">"{habitToDelete.habit || habitToDelete.newHabit}"</p>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mb-2">Are you sure you want to delete all {habits.length} habits?</p>
              )}
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => { setShowDeleteConfirm(false); setHabitToDelete(null); }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App