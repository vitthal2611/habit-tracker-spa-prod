import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Navigation from './components/Navigation'
import HabitForm from './components/HabitForm'
import HabitList from './components/HabitList'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Modal from './components/ui/Modal'
import Auth from './components/Auth'
import { useFirestore } from './hooks/useFirestore'
import { generateTestHabits } from './utils/testHabits'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const [habits, { addItem: addHabitToDb, updateItem: updateHabitInDb, deleteItem: deleteHabitFromDb, loading }] = useFirestore('habits', [])
  const [showForm, setShowForm] = useState(false)
  const [showActionAlert, setShowActionAlert] = useState(false)
  const [alertHabits, setAlertHabits] = useState([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationHabit, setCelebrationHabit] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [groupBy, setGroupBy] = useState('none')
  const [checkinDate, setCheckinDate] = useState(new Date())
  const [showCompleted, setShowCompleted] = useState(false)

  const today = new Date().toDateString()
  const completedToday = habits.filter(h => h.completions[today]).length
  const totalHabits = habits.length
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

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
    }
  }

  const updateHabit = async (updatedHabit) => {
    await updateHabitInDb(updatedHabit)
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (habits.length > 0) {
        checkMissedHabits()
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [habits])

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
          <HabitList habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} onUpdate={updateHabit} groupBy={groupBy} />
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
        <HabitList habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} onUpdate={updateHabit} groupBy={groupBy} />
      )}
    </div>
  )
  }

  const renderProgress = () => {
    const [period, setPeriod] = useState('week')
    const data = getProgressData(period)

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Progress Tracking</h2>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-auto"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
            <div className="space-y-2">
              {data.slice(-7).map((day, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{day.date}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${day.rate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">{day.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Habit Streaks</h3>
            <div className="space-y-3">
              {habits.slice(0, 5).map(habit => (
                <div key={habit.id} className="flex justify-between items-center">
                  <span className="text-sm truncate">{habit.newHabit}</span>
                  <span className="text-sm font-medium">{habit.streak} days</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const renderCheckin = () => {
    const checkinDateStr = checkinDate.toDateString()
    const dayName = checkinDate.toLocaleDateString('en', { weekday: 'short' })
    const isToday = checkinDateStr === today
    
    const allDayHabits = habits.filter(h => {
      return !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
    })
    
    const dayHabits = showCompleted 
      ? allDayHabits.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      : allDayHabits.filter(h => !h.completions[checkinDateStr]).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    
    const getTimeGroup = (time) => {
      if (!time) return 'No Time Set'
      const hour = parseInt(time.split(':')[0])
      if (hour < 12) return 'Morning'
      if (hour < 17) return 'Afternoon'
      return 'Evening'
    }
    
    const groupedByTime = dayHabits.reduce((acc, habit) => {
      const group = getTimeGroup(habit.time)
      if (!acc[group]) acc[group] = []
      acc[group].push(habit)
      return acc
    }, {})
    
    const timeOrder = ['Morning', 'Afternoon', 'Evening', 'No Time Set']
    const completedCount = allDayHabits.filter(h => h.completions[checkinDateStr]).length
    const totalCount = allDayHabits.length
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
    
    const navigateDay = (direction) => {
      const newDate = new Date(checkinDate)
      newDate.setDate(newDate.getDate() + direction)
      setCheckinDate(newDate)
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -m-8 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-3xl opacity-10 blur-3xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
              <div className="text-4xl sm:text-5xl mb-3 animate-bounce">{progressPercent === 100 && totalCount > 0 ? '🎉' : '✨'}</div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">Daily Check-in</h1>
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button 
                  onClick={() => navigateDay(-1)}
                  className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                >
                  ←
                </button>
                
                <div className="text-center px-4">
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
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
                  className="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                >
                  →
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="url(#gradient)" strokeWidth="8" fill="none"
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
                    <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100">{Math.round(progressPercent)}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{completedCount}/{totalCount}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Habits Completed</div>
                </div>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    showCompleted 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {showCompleted ? 'Hide Completed' : 'Show Completed'}
                </button>
              </div>
            </div>
          </div>

          {totalCount === 0 ? (
            <div className="text-center py-8">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">No habits scheduled</h3>
                <p className="text-gray-600 dark:text-gray-400">Enjoy your day off or create new habits!</p>
              </div>
            </div>
          ) : dayHabits.length === 0 && !showCompleted ? (
            <div className="text-center py-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-200/50">
                <div className="text-5xl mb-4 animate-pulse">🎉</div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">All Done!</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">Amazing work! You've completed all your habits.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {timeOrder.map(timeGroup => {
                const habits = groupedByTime[timeGroup]
                if (!habits || habits.length === 0) return null
                
                const groupIcon = timeGroup === 'Morning' ? '🌅' : timeGroup === 'Afternoon' ? '☀️' : timeGroup === 'Evening' ? '🌙' : '⏰'
                
                return (
                  <div key={timeGroup} className="space-y-3">
                    <div className="flex items-center space-x-2 px-2">
                      <span className="text-lg">{groupIcon}</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{timeGroup}</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{habits.length} habit{habits.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {habits.map((habit, index) => {
                        const isCompleted = habit.completions[checkinDateStr]
                        return (
                          <div key={habit.id} className="group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow hover:shadow-md transition-all border ${
                              isCompleted 
                                ? 'border-green-200 dark:border-green-700' 
                                : 'border-gray-200 dark:border-gray-700'
                            }`}>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => toggleHabit(habit.id, checkinDateStr)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    isCompleted
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                                  }`}
                                >
                                  {isCompleted && '✓'}
                                </button>
                                
                                <div className="text-sm text-gray-600 dark:text-gray-400 w-16">
                                  {habit.time || '--:--'}
                                </div>
                                
                                <div className={`flex-1 text-sm ${
                                  isCompleted 
                                    ? 'text-gray-500 dark:text-gray-400 line-through' 
                                    : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                  {habit.newHabit}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome()
      case 'habits': return renderHabits()
      case 'checkin': return renderCheckin()
      default: return renderHome()
    }
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {renderContent()}
      </main>
      <HabitForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        onSubmit={addHabit}
        habits={habits}
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
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{habit.newHabit}</div>
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
              Every {celebrationHabit.newHabit} builds your identity.
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
      
      {showDeleteConfirm && habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Habit?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Are you sure you want to delete:</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">"{habitToDelete.newHabit}"</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
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