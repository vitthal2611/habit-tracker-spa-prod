import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar, CheckSquare } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Navigation from './components/Navigation'
import QuickHabitForm from './components/QuickHabitForm'
import HabitList from './components/HabitList'
import HabitTableView from './components/HabitTableView'
import DailyHabitView from './components/DailyHabitView'
import EisenhowerMatrix from './components/EisenhowerMatrix'
import StickyAddButton from './components/ui/StickyAddButton'

import EnhancedDashboard from './components/EnhancedDashboard'
import Auth from './components/Auth'
import { useFirestore } from './hooks/useFirestore'
import { useHabitLinkedList } from './hooks/useHabitLinkedList'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dbHabits, { addItem: addHabitToDb, updateItem: updateHabitInDb, deleteItem: deleteHabitFromDb, loading }] = useFirestore('habits', [])
  const { habits, removeHabit: removeFromList } = useHabitLinkedList(dbHabits)

  const [showQuickForm, setShowQuickForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [selectedHabits, setSelectedHabits] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [toast, setToast] = useState(null)
  const [groupBy, setGroupBy] = useState('none')
  const [viewMode, setViewMode] = useState('today')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dbTodos, { addItem: addTodoToDb, updateItem: updateTodoInDb, deleteItem: deleteTodoFromDb }] = useFirestore('todos', [])
  const [activeTab, setActiveTab] = useState('habits')

  const today = new Date().toDateString()
  
  const getTodayMetrics = () => {
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    const dayName = todayDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = todayDate.toISOString().split('T')[0]
    
    const todayHabits = habits.filter(h => {
      const habitStartDate = new Date(h.createdAt || h.id)
      if (isNaN(habitStartDate.getTime())) return false
      habitStartDate.setHours(0, 0, 0, 0)
      
      if (todayDate < habitStartDate) return false
      
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
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    let totalScheduled = 0
    let totalCompleted = 0
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + mondayOffset + i)
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toDateString()
      const dayName = date.toLocaleDateString('en', { weekday: 'short' })
      const dateKey = date.toISOString().split('T')[0]
      
      habits.forEach(h => {
        const habitStartDate = new Date(h.createdAt || h.id)
        if (isNaN(habitStartDate.getTime())) return
        habitStartDate.setHours(0, 0, 0, 0)
        
        if (date < habitStartDate) return
        
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
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
      if (isNaN(habitCreatedDate.getTime())) return
      
      for (let i = 0; i < 100; i++) {
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
      console.error('Update error:', err)
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        setUser(user)
        setAuthLoading(false)
      } catch (error) {
        console.error('Authentication error:', error)
        setAuthLoading(false)
        showToast('Authentication error occurred', 'error')
      }
    })
    return unsubscribe
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      showToast('Failed to logout', 'error')
    }
  }

  const renderDashboard = () => {
    if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div></div>
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Tab Toggle */}
        <div className="mb-6">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('habits')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'habits'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Target className="w-4 h-4" />Habits
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'todos'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <CheckSquare className="w-4 h-4" />To-Do
            </button>

          </div>
        </div>

        {/* Enhanced Dashboard - Only for Habits */}
        {activeTab === 'habits' && (
          <EnhancedDashboard 
            habits={habits}
            totalHabits={totalHabits}
            completedToday={completedToday}
            completionRate={completionRate}
            onAddHabit={() => setShowQuickForm(true)}
            viewMode={viewMode}
            setViewMode={(mode) => {
              setViewMode(mode)
              if (mode === 'today') setCurrentDate(new Date())
            }}
            isSelectionMode={isSelectionMode}
            selectedHabits={selectedHabits}
            onSelectAll={selectAllHabits}
            onClearSelection={clearSelection}
            onDeleteSelected={deleteSelectedHabits}
            setIsSelectionMode={setIsSelectionMode}
          />
        )}

        {/* Content Section */}
        {activeTab === 'todos' ? (
          <EisenhowerMatrix 
            todos={dbTodos}
            onAdd={addTodoToDb}
            onToggle={async (id) => {
              const todo = dbTodos.find(t => t.id === id)
              if (todo) {
                await updateTodoInDb({ 
                  ...todo, 
                  completed: !todo.completed,
                  completedAt: !todo.completed ? new Date().toISOString() : null
                })
              }
            }}
            onUpdate={updateTodoInDb}
            onDelete={deleteTodoFromDb}
            allCategories={[
              { id: 'work', name: 'Work', color: 'bg-blue-500' },
              { id: 'personal', name: 'Personal', color: 'bg-green-500' },
              { id: 'health', name: 'Health', color: 'bg-red-500' },
              { id: 'learning', name: 'Learning', color: 'bg-purple-500' },
              { id: 'other', name: 'Other', color: 'bg-gray-500' }
            ]}
          />
        ) : viewMode === 'table' ? (
          <div>
            <HabitTableView habits={habits} onDelete={deleteHabit} onUpdate={updateHabit} onDuplicate={duplicateHabit} isSelectionMode={isSelectionMode} selectedHabits={selectedHabits} onToggleSelection={toggleHabitSelection} />
          </div>
        ) : viewMode === 'today' ? (
          <div>
            <DailyHabitView habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} onUpdate={updateHabit} onAdd={addHabit} onDuplicate={duplicateHabit} currentDate={currentDate} setCurrentDate={setCurrentDate} isSelectionMode={isSelectionMode} selectedHabits={selectedHabits} onToggleSelection={toggleHabitSelection} />
          </div>
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
                <select 
                  value={groupBy} 
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Grouping</option>
                  <option value="identity">By Identity</option>
                  <option value="location">By Location</option>
                </select>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {habits.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Welcome to Habit Tracker!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Build better habits with habit stacking</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">Link new habits to existing ones: "After I [current habit], I will [new habit]"</p>
                  <button onClick={() => setShowQuickForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />Create Your First Habit
                  </button>
                </div>
              ) : (
                <>
                  <HabitList habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} onUpdate={updateHabit} onDuplicate={duplicateHabit} groupBy={groupBy} isSelectionMode={isSelectionMode} selectedHabits={selectedHabits} onToggleSelection={toggleHabitSelection} />
                </>
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
    <div className="min-h-screen dashboard-gradient">
      <Navigation onLogout={handleLogout} />
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6 pb-20 sm:pb-6">
        {renderDashboard()}
      </main>
      
      {/* Mobile Sticky Add Button - Only show on mobile when habits exist */}
      {habits.length > 0 && (
        <div className="block sm:hidden">
          <StickyAddButton onClick={() => setShowQuickForm(true)} />
        </div>
      )}
      {showQuickForm && (
        <QuickHabitForm
          habits={habits}
          onSubmit={addHabit}
          onClose={() => setShowQuickForm(false)}
        />
      )}
      
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in p-4"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowDeleteConfirm(false)}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Habit{selectedHabits.size > 1 ? 's' : ''}?</h3>
              {habitToDelete ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Are you sure you want to delete:</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">"{habitToDelete.habit || habitToDelete.newHabit}"</p>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mb-2">Delete {selectedHabits.size} selected habit{selectedHabits.size > 1 ? 's' : ''}?</p>
              )}
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => { setShowDeleteConfirm(false); setHabitToDelete(null); }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs font-bold uppercase tracking-wide"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-xs font-bold uppercase tracking-wide shadow-md hover:shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white font-medium`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App