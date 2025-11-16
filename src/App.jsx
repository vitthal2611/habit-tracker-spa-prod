import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Navigation from './components/Navigation'
import HabitFormV2 from './components/HabitFormV2'
import HabitList from './components/HabitList'
import DailyHabitView from './components/DailyHabitView'
import Button from './components/ui/Button'
import Auth from './components/Auth'
import { useFirestore } from './hooks/useFirestore'
import { useHabitLinkedList } from './hooks/useHabitLinkedList'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dbHabits, { addItem: addHabitToDb, updateItem: updateHabitInDb, deleteItem: deleteHabitFromDb, loading }] = useFirestore('habits', [])
  const { habits, removeHabit: removeFromList } = useHabitLinkedList(dbHabits)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [groupBy, setGroupBy] = useState('none')
  const [viewMode, setViewMode] = useState('today')

  const today = new Date().toDateString()
  
  const getTodayMetrics = () => {
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
  }
  
  const metrics = viewMode === 'today' ? getTodayMetrics() : getWeeklyMetrics()
  const completedToday = metrics.completed
  const totalHabits = metrics.total
  const completionRate = metrics.rate

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
    } catch (err) {
      console.error('Error adding habit:', err)
      alert('Failed to add habit. Please try again.')
    }
  }

  const toggleHabit = async (id, dateKey = today) => {
    try {
      const habit = habits.find(h => h.id === id)
      if (!habit) return
      
      const checkinDate = new Date(dateKey)
      const createdDate = new Date(habit.createdAt || habit.id)
      
      const checkinDateOnly = new Date(checkinDate)
      const createdDateOnly = new Date(createdDate)
      checkinDateOnly.setHours(0, 0, 0, 0)
      createdDateOnly.setHours(0, 0, 0, 0)
      
      if (checkinDateOnly < createdDateOnly) return
      
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
    } catch (err) {
      console.error('Error toggling habit:', err)
      alert('Failed to update habit. Please try again.')
    }
  }

  const deleteHabit = (id) => {
    const habit = habits.find(h => h.id === id)
    setHabitToDelete(habit)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      if (habitToDelete) {
        const result = removeFromList(habitToDelete.id)
        
        if (result) {
          if (result.next) await updateHabitInDb(result.next)
          if (result.prev) await updateHabitInDb(result.prev)
          
          const orphanedHabits = habits.filter(h => 
            h.id !== habitToDelete.id && 
            (h.currentHabit === result.deletedName || h.stackAfter === result.deletedId)
          )
          
          for (const habit of orphanedHabits) {
            const prevName = result.prev ? (result.prev.newHabit || result.prev.habit) : ''
            await updateHabitInDb({
              ...habit,
              currentHabit: prevName,
              stackAfter: result.prev?.id || null,
              prevId: result.prev?.id || null,
              habitStatement: prevName ? `After I ${prevName}, I will ${habit.newHabit}` : `I will ${habit.newHabit}`
            })
          }
        }
        
        await deleteHabitFromDb(habitToDelete.id)
      } else {
        for (const habit of habits) {
          await deleteHabitFromDb(habit.id)
        }
      }
    } catch (err) {
      console.error('Error deleting habit:', err)
      alert('Failed to delete habit. Please try again.')
    } finally {
      setShowDeleteConfirm(false)
      setHabitToDelete(null)
    }
  }

  const updateHabit = async (updatedHabit) => {
    try {
      await updateHabitInDb(updatedHabit)
    } catch (err) {
      console.error('Error updating habit:', err)
      alert('Failed to update habit. Please try again.')
    }
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  const renderDashboard = () => {
    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            {habits.length > 0 && (
              <Button onClick={() => setShowDeleteConfirm(true)} variant="secondary" size="md" className="flex-1 sm:flex-none">
                <span className="hidden sm:inline">Delete All</span><span className="sm:hidden">Clear</span>
              </Button>
            )}
            <Button onClick={() => setShowForm(true)} size="md" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex-1 sm:flex-none">
              <Plus className="w-5 h-5 mr-2" /><span className="hidden sm:inline">Add Habit</span><span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

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
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        {renderDashboard()}
      </main>
      <HabitFormV2 
        isOpen={showForm} 
        onClose={() => {
          setShowForm(false)
          setEditingHabit(null)
        }} 
        onSubmit={handleFormSubmit}
        habits={habits}
        editingHabit={editingHabit}
      />
      
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
