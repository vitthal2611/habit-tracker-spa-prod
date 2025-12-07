import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar, CheckSquare, DollarSign } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Navigation from './components/Navigation'
import QuickHabitForm from './components/QuickHabitForm'
import HabitList from './components/HabitList'
import HabitTableView from './components/HabitTableView'
import DailyHabitView from './components/DailyHabitView'
import TodoList from './components/TodoList'
import YearlyBudget from './components/YearlyBudget'
import Transactions from './components/Transactions'
import Dashboard from './components/Dashboard'
import Button from './components/ui/Button'
import Auth from './components/Auth'
import { useFirestore } from './hooks/useFirestore'
import { useHabitLinkedList } from './hooks/useHabitLinkedList'
import { DEFAULT_BUDGET_CATEGORIES } from './utils/budgetCategories'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dbHabits, { addItem: addHabitToDb, updateItem: updateHabitInDb, deleteItem: deleteHabitFromDb, loading }] = useFirestore('habits', [])
  const { habits, removeHabit: removeFromList } = useHabitLinkedList(dbHabits)

  // Removed auto-sync to prevent overwriting manual edits
  

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
  const [dbCategories, { addItem: addCategoryToDb, deleteItem: deleteCategoryFromDb }] = useFirestore('todoCategories', [])
  const [dbYearlyBudgets, { addItem: addYearlyBudgetToDb, updateItem: updateYearlyBudgetInDb }] = useFirestore('yearlyBudgets', [])
  const [dbTransactions, { addItem: addTransactionToDb, updateItem: updateTransactionInDb, deleteItem: deleteTransactionFromDb }] = useFirestore('transactions', [])
  const [dbSettings, { addItem: addSettingToDb, updateItem: updateSettingInDb }] = useFirestore('settings', [])
  const currentYear = new Date().getFullYear()
  const currentYearBudget = dbYearlyBudgets.find(b => b.year === currentYear)
  const [activeTab, setActiveTab] = useState('habits')
  
  const paymentModes = dbSettings.find(s => s.id === 'paymentModes')?.modes || ['Cash', 'Card', 'UPI', 'Bank']
  const initialBalances = dbSettings.find(s => s.id === 'initialBalances')?.balances || {}

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

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const generateTestData = async () => {
    const testHabits = [
      { identity: 'healthy person', current: 'wake up', new: 'drink water', time: '06:00', location: 'kitchen' },
      { identity: 'healthy person', current: 'drink water', new: 'stretch', time: '06:05', location: 'bedroom' },
      { identity: 'healthy person', current: 'stretch', new: 'meditate', time: '06:15', location: 'living room' },
      { identity: 'fit person', current: 'meditate', new: 'exercise', time: '06:30', location: 'gym' },
      { identity: 'fit person', current: 'exercise', new: 'shower', time: '07:30', location: 'bathroom' },
      { identity: 'organized person', current: 'shower', new: 'make bed', time: '08:00', location: 'bedroom' },
      { identity: 'organized person', current: 'make bed', new: 'plan day', time: '08:10', location: 'desk' },
      { identity: 'productive person', current: 'plan day', new: 'check emails', time: '08:30', location: 'office' },
      { identity: 'productive person', current: 'check emails', new: 'deep work', time: '09:00', location: 'office' },
      { identity: 'focused person', current: 'deep work', new: 'take break', time: '11:00', location: 'outside' },
      { identity: 'healthy person', current: 'take break', new: 'eat lunch', time: '12:00', location: 'kitchen' },
      { identity: 'healthy person', current: 'eat lunch', new: 'walk', time: '12:30', location: 'park' },
      { identity: 'productive person', current: 'walk', new: 'work session', time: '13:00', location: 'office' },
      { identity: 'learner', current: 'work session', new: 'read', time: '15:00', location: 'library' },
      { identity: 'learner', current: 'read', new: 'take notes', time: '15:30', location: 'desk' },
      { identity: 'creative person', current: 'take notes', new: 'brainstorm', time: '16:00', location: 'office' },
      { identity: 'creative person', current: 'brainstorm', new: 'write', time: '16:30', location: 'desk' },
      { identity: 'social person', current: 'write', new: 'call friend', time: '17:00', location: 'phone' },
      { identity: 'organized person', current: 'call friend', new: 'tidy up', time: '17:30', location: 'home' },
      { identity: 'healthy person', current: 'tidy up', new: 'cook dinner', time: '18:00', location: 'kitchen' },
      { identity: 'mindful person', current: 'cook dinner', new: 'eat mindfully', time: '19:00', location: 'dining room' },
      { identity: 'family person', current: 'eat mindfully', new: 'family time', time: '19:30', location: 'living room' },
      { identity: 'learner', current: 'family time', new: 'study', time: '20:00', location: 'desk' },
      { identity: 'creative person', current: 'study', new: 'hobby time', time: '20:30', location: 'studio' },
      { identity: 'organized person', current: 'hobby time', new: 'prepare tomorrow', time: '21:00', location: 'bedroom' },
      { identity: 'grateful person', current: 'prepare tomorrow', new: 'journal', time: '21:15', location: 'desk' },
      { identity: 'mindful person', current: 'journal', new: 'gratitude practice', time: '21:30', location: 'bedroom' },
      { identity: 'healthy person', current: 'gratitude practice', new: 'skincare routine', time: '21:45', location: 'bathroom' },
      { identity: 'reader', current: 'skincare routine', new: 'read book', time: '22:00', location: 'bed' },
      { identity: 'healthy person', current: 'read book', new: 'sleep', time: '22:30', location: 'bedroom' }
    ]

    for (const habit of testHabits) {
      const habitData = {
        identity: habit.identity,
        currentHabit: habit.current,
        newHabit: habit.new,
        time: habit.time,
        location: habit.location,
        schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        streak: 0,
        completions: {},
        createdAt: new Date().toISOString()
      }
      await addHabitToDb(habitData)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    showToast('30 test habits added!')
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
      setUser(user)
      setAuthLoading(false)
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
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'habits'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Target className="w-4 h-4" />Habits
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'todos'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <CheckSquare className="w-4 h-4" />To-Do
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'budget'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <DollarSign className="w-4 h-4" />Budget
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <TrendingUp className="w-4 h-4" />Transactions
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Calendar className="w-4 h-4" />Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards - Only for Habits */}
        {activeTab === 'habits' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Habits</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Build better habits daily</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {habits.length > 0 && (
                  <>
                    {isSelectionMode ? (
                      <>
                        <button onClick={selectAllHabits} className="px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                          Select All
                        </button>
                        <button onClick={clearSelection} className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                          Cancel
                        </button>
                        {selectedHabits.size > 0 && (
                          <button onClick={deleteSelectedHabits} className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            Delete ({selectedHabits.size})
                          </button>
                        )}
                      </>
                    ) : (
                      <button onClick={() => setIsSelectionMode(true)} className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                        Select
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setShowQuickForm(true)} className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />Add Habit
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{totalHabits}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Habits</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Today</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{completedToday}<span className="text-lg sm:text-xl text-gray-400">/{totalHabits}</span></h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Rate</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{completionRate}%</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Success Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* View Toggle (only for habits) */}
        {activeTab === 'habits' && (
          <div className="mb-6">
            <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-full overflow-x-auto">
              <button
                onClick={() => { setViewMode('today'); setCurrentDate(new Date()); }}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ${
                  viewMode === 'today'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />Today
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ${
                  viewMode === 'weekly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />Weekly
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />Table
              </button>
            </div>
          </div>
        )}

        {/* Content Section */}
        {activeTab === 'budget' ? (
          <YearlyBudget
            budgetData={currentYearBudget}
            transactions={dbTransactions}
            dbYearlyBudgets={dbYearlyBudgets}
            onSave={async (budget) => {
              try {
                const budgetData = {
                  ...budget,
                  year: budget.year || currentYear,
                  categories: budget.categories || [],
                  updatedAt: new Date().toISOString()
                }
                
                // Find existing budget for the specific year
                const existingBudget = dbYearlyBudgets.find(b => b.year === budgetData.year)
                
                if (existingBudget) {
                  await updateYearlyBudgetInDb({ ...budgetData, id: existingBudget.id })
                } else {
                  await addYearlyBudgetToDb({ ...budgetData, id: `budget_${budgetData.year}`, createdAt: new Date().toISOString() })
                }
                showToast(`Budget saved for ${budgetData.year}!`)
              } catch (error) {
                console.error('Budget save error:', error)
                showToast(`Failed to save budget: ${error.message}`, 'error')
              }
            }}
          />
        ) : activeTab === 'transactions' ? (
          <Transactions
            transactions={dbTransactions}
            budgetCategories={currentYearBudget?.categories || DEFAULT_BUDGET_CATEGORIES}
            year={currentYear}
            modes={paymentModes}
            initialBalances={initialBalances}
            onUpdateModes={async (modes) => {
              const existing = dbSettings.find(s => s.id === 'paymentModes')
              if (existing) {
                await updateSettingInDb({ id: 'paymentModes', modes })
              } else {
                await addSettingToDb({ id: 'paymentModes', modes })
              }
            }}
            onUpdateBalances={async (balances) => {
              const existing = dbSettings.find(s => s.id === 'initialBalances')
              if (existing) {
                await updateSettingInDb({ id: 'initialBalances', balances })
              } else {
                await addSettingToDb({ id: 'initialBalances', balances })
              }
            }}
            onAdd={(transaction) => {
              addTransactionToDb(transaction)
              showToast('Transaction added!')
            }}
            onUpdate={(transaction) => {
              updateTransactionInDb(transaction)
              showToast('Transaction updated!')
            }}
            onDelete={(id) => {
              deleteTransactionFromDb(id)
              showToast('Transaction deleted!')
            }}
          />
        ) : activeTab === 'dashboard' ? (
          <Dashboard
            transactions={dbTransactions}
            budgetCategories={currentYearBudget?.categories || DEFAULT_BUDGET_CATEGORIES}
            year={currentYear}
          />
        ) : activeTab === 'todos' ? (
          <TodoList 
            todos={dbTodos}
            categories={dbCategories}
            onAdd={addTodoToDb}
            onToggle={async (id) => {
              const todo = dbTodos.find(t => t.id === id)
              if (todo) {
                const newStatus = (todo.status === 'completed' || todo.completed) ? 'backlog' : 'completed'
                await updateTodoInDb({ 
                  ...todo, 
                  completed: newStatus === 'completed',
                  status: newStatus,
                  completedAt: newStatus === 'completed' ? new Date().toISOString() : null
                })
              }
            }}
            onUpdate={updateTodoInDb}
            onDelete={deleteTodoFromDb}
            onAddCategory={async (category) => {
              await addCategoryToDb({ ...category, id: category.id, createdAt: new Date().toISOString() })
            }}
            onDeleteCategory={deleteCategoryFromDb}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation onLogout={handleLogout} />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {renderDashboard()}
      </main>
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
