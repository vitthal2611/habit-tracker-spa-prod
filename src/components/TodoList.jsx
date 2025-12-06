import { useState, useEffect } from 'react'
import { Plus, X, Check, Circle, Edit2, Calendar } from 'lucide-react'

const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Work', color: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'personal', name: 'Personal', color: 'bg-purple-500', lightBg: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'health', name: 'Health', color: 'bg-green-500', lightBg: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'learning', name: 'Learning', color: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'other', name: 'Other', color: 'bg-slate-500', lightBg: 'bg-slate-50 dark:bg-slate-900/20' }
]

const COLORS = DEFAULT_CATEGORIES.map(c => ({ color: c.color, lightBg: c.lightBg })).concat([
  { color: 'bg-red-500', lightBg: 'bg-red-50 dark:bg-red-900/20' },
  { color: 'bg-pink-500', lightBg: 'bg-pink-50 dark:bg-pink-900/20' },
  { color: 'bg-indigo-500', lightBg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { color: 'bg-teal-500', lightBg: 'bg-teal-50 dark:bg-teal-900/20' },
  { color: 'bg-orange-500', lightBg: 'bg-orange-50 dark:bg-orange-900/20' }
])

export default function TodoList({ todos, onAdd, onToggle, onDelete, onUpdate, categories, onAddCategory, onDeleteCategory }) {
  const [newTodo, setNewTodo] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('personal')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)
  const [focusMode, setFocusMode] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  
  const allCategories = [...DEFAULT_CATEGORIES, ...(categories || [])]

  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [timeEstimate, setTimeEstimate] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPattern, setRecurringPattern] = useState('daily')
  const [recurringDay, setRecurringDay] = useState('Mon')

  const [showOverdueNotice, setShowOverdueNotice] = useState(false)
  const [overdueCount, setOverdueCount] = useState(0)

  useEffect(() => {
    if (todos.length === 0) return
    
    const todayStr = new Date().toISOString().split('T')[0]
    const overdueTodos = todos.filter(todo => 
      !todo.completed && todo.dueDate && todo.dueDate < todayStr
    )
    
    if (overdueTodos.length > 0) {
      setOverdueCount(overdueTodos.length)
      setShowOverdueNotice(true)
      setTimeout(() => setShowOverdueNotice(false), 5000)
    }
  }, [])

  const [addSuccess, setAddSuccess] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (newTodo.trim()) {
      const todoId = `todo_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      try {
        await onAdd({
          id: todoId,
          text: newTodo.trim(),
          category: selectedCategory,
          completed: false,
          status: 'backlog',
          dueDate: dueDate || null,
          priority: priority,
          timeEstimate: timeEstimate || null,
          subtasks: [],
          isRecurring: isRecurring,
          recurringPattern: isRecurring ? recurringPattern : null,
          recurringDay: isRecurring && recurringPattern === 'weekly' ? recurringDay : null,
          createdAt: new Date().toISOString()
        })
        setNewTodo('')
        setDueDate('')
        setPriority('medium')
        setTimeEstimate('')
        setIsRecurring(false)
        setRecurringPattern('daily')
        setAddSuccess(true)
        setTimeout(() => setAddSuccess(false), 2000)
        setShowQuickAdd(false)
      } catch (err) {
        console.error('Error adding todo:', err)
      }
    }
  }

  const filteredTodos = filterCategory === 'all' 
    ? todos 
    : todos.filter(todo => todo.category === filterCategory)

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  let backlogTodos = sortedTodos.filter(t => {
    const status = t.status || (t.completed ? 'completed' : 'backlog')
    return status === 'backlog'
  })
  let inProgressTodos = sortedTodos.filter(t => {
    const status = t.status || (t.completed ? 'completed' : 'backlog')
    return status === 'in-progress'
  })
  let completedTodos = sortedTodos.filter(t => {
    const status = t.status || (t.completed ? 'completed' : 'backlog')
    return status === 'completed'
  })

  if (focusMode) {
    const today = new Date().toISOString().split('T')[0]
    const highPriorityTasks = [...backlogTodos, ...inProgressTodos]
      .filter(t => t.priority === 'high' || t.dueDate === today)
      .slice(0, 3)
    backlogTodos = highPriorityTasks.filter(t => (t.status || 'backlog') === 'backlog')
    inProgressTodos = highPriorityTasks.filter(t => t.status === 'in-progress')
    completedTodos = []
  }

  const groupByDate = (todos) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const groups = { overdue: [], today: [], tomorrow: [], later: [], noDate: [] }
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    
    todos.forEach(todo => {
      if (!todo.dueDate) {
        groups.noDate.push(todo)
      } else {
        const dueDate = new Date(todo.dueDate + 'T00:00:00')
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        if (dueDate < today) groups.overdue.push(todo)
        else if (dueDate.getTime() === today.getTime()) groups.today.push(todo)
        else if (dueDate.getTime() === tomorrow.getTime()) groups.tomorrow.push(todo)
        else groups.later.push(todo)
      }
    })
    
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const aPriority = priorityOrder[a.priority || 'medium']
        const bPriority = priorityOrder[b.priority || 'medium']
        return aPriority - bPriority
      })
    })
    return groups
  }

  const calculateTotalTime = (todos) => {
    let totalMinutes = 0
    todos.forEach(todo => {
      if (todo.timeEstimate) {
        const time = todo.timeEstimate.toLowerCase()
        if (time.includes('h')) {
          const hours = parseFloat(time)
          totalMinutes += hours * 60
        } else if (time.includes('m')) {
          totalMinutes += parseFloat(time)
        }
      }
    })
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return '0m'
  }

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return sortedTodos.filter(t => {
      const status = t.status || (t.completed ? 'completed' : 'backlog')
      if (status === 'completed') return false
      if (t.dueDate === today) return true
      if (!t.dueDate && status === 'in-progress') return true
      return false
    })
  }

  const todayTasks = getTodayTasks()
  const todayTotalTime = calculateTotalTime(todayTasks)

  const backlogGroups = groupByDate(backlogTodos)
  const inProgressGroups = groupByDate(inProgressTodos)
  const completedGroups = groupByDate(completedTodos)

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4">
      {/* Overdue Notice */}
      {showOverdueNotice && (
        <div className="bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 p-4 rounded-lg animate-fade-in">
          <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
            ⚠️ You have {overdueCount} overdue task{overdueCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Success Toast */}
      {addSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span className="font-semibold">Task added!</span>
        </div>
      )}
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">To-Do List</h2>
        
        {/* Add Todo Form */}
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <input
                type="text"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
                placeholder="30m"
                className="w-16 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                priority === 'high'
                  ? 'bg-red-500 text-white shadow-md scale-105'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200'
              }`}
            >
              🔴 High
            </button>
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                priority === 'medium'
                  ? 'bg-yellow-500 text-white shadow-md scale-105'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200'
              }`}
            >
              🟡 Medium
            </button>
            <button
              type="button"
              onClick={() => setPriority('low')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                priority === 'low'
                  ? 'bg-blue-500 text-white shadow-md scale-105'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200'
              }`}
            >
              🔵 Low
            </button>
          </div>

          {/* Recurring Task Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              🔄 Recurring Task
            </label>
          </div>

          {/* Recurring Pattern */}
          {isRecurring && (
            <div className="flex gap-2">
              <select
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {recurringPattern === 'weekly' && (
                <select
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="Mon">Monday</option>
                  <option value="Tue">Tuesday</option>
                  <option value="Wed">Wednesday</option>
                  <option value="Thu">Thursday</option>
                  <option value="Fri">Friday</option>
                  <option value="Sat">Saturday</option>
                  <option value="Sun">Sunday</option>
                </select>
              )}
            </div>
          )}

          {/* Category Selection */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <div key={cat.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? `${cat.color} text-white shadow-sm`
                      : `${cat.lightBg} text-slate-700 dark:text-slate-300 hover:opacity-80`
                  }`}
                >
                  {cat.name}
                </button>
                {!DEFAULT_CATEGORIES.find(c => c.id === cat.id) && (
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowCategoryForm(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-gray-500 transition-all"
            >
              + New Category
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
            filterCategory === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600'
          }`}
        >
          All ({todos.length})
        </button>
        {allCategories.map(cat => {
          const count = todos.filter(t => t.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? `${cat.color} text-white`
                  : `${cat.lightBg} text-slate-700 dark:text-slate-300 hover:opacity-80`
              }`}
            >
              {cat.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Category Creation Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCategoryForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Category</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (newCategoryName.trim()) {
                const colorSet = COLORS[selectedColor]
                let categoryId = newCategoryName.toLowerCase().replace(/\s+/g, '-')
                if (allCategories.find(c => c.id === categoryId)) {
                  categoryId = `${categoryId}-${Date.now()}`
                }
                onAddCategory({
                  id: categoryId,
                  name: newCategoryName.trim(),
                  color: colorSet.color,
                  lightBg: colorSet.lightBg
                })
                setNewCategoryName('')
                setSelectedColor(0)
                setShowCategoryForm(false)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{'Category Name'}</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Shopping, Finance"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{'Color'}</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map((colorSet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(idx)}
                      className={`w-full h-10 rounded-lg ${colorSet.color} transition-all ${
                        selectedColor === idx ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Focus Mode Toggle & Today's Time */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">📅 Today:</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{todayTasks.length} {todayTasks.length === 1 ? 'task' : 'tasks'}</span>
            {todayTotalTime && todayTotalTime !== '0m' && (
              <>
                <span className="text-slate-400">|</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">⏱️ {todayTotalTime}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setFocusMode(!focusMode)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            focusMode
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
              : 'bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
          }`}
        >
          {focusMode ? '🎯 Focus Mode ON' : '🎯 Focus Mode'}
        </button>
      </div>

      {/* Progress Overview */}
      {!focusMode && (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Overall Progress</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {filteredTodos.length > 0 ? Math.round((completedTodos.length / filteredTodos.length) * 100) : 0}%
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500" 
            style={{ width: `${filteredTodos.length > 0 ? (completedTodos.length / filteredTodos.length) * 100 : 0}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">📋 {backlogTodos.length}</span>
          <span className="text-slate-500 dark:text-slate-400">🔄 {inProgressTodos.length}</span>
          <span className="text-slate-500 dark:text-slate-400">✅ {completedTodos.length}</span>
        </div>
      </div>
      )}

      {focusMode && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
          <h3 className="text-lg font-bold mb-2">🎯 Focus Mode Active</h3>
          <p className="text-sm opacity-90">Showing top 3 priority tasks. Complete these first!</p>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Backlog Column */}
        <KanbanColumn 
          title="📋 Backlog" 
          count={backlogTodos.length}
          color="from-slate-500 to-slate-600"
          groups={backlogGroups}
          onUpdate={onUpdate}
          onToggle={onToggle}
          onDelete={onDelete}
          onAdd={onAdd}
          allCategories={allCategories}
        />

        {/* In Progress Column */}
        <KanbanColumn 
          title="🔄 In Progress" 
          count={inProgressTodos.length}
          color="from-blue-500 to-indigo-600"
          groups={inProgressGroups}
          onUpdate={onUpdate}
          onToggle={onToggle}
          onDelete={onDelete}
          onAdd={onAdd}
          allCategories={allCategories}
        />

        {/* Completed Column */}
        <KanbanColumn 
          title="✅ Completed" 
          count={completedTodos.length}
          color="from-green-500 to-emerald-600"
          groups={completedGroups}
          onUpdate={onUpdate}
          onToggle={onToggle}
          onDelete={onDelete}
          onAdd={onAdd}
          allCategories={allCategories}
        />
      </div>

      {/* Empty State */}
      {filteredTodos.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
          <Circle className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No tasks yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add your first task to get started</p>
        </div>
      )}

      {/* Quick Add Floating Button */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        title="Quick Add Task"
        aria-label="Quick Add Task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowQuickAdd(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Add Task</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <input
                  type="text"
                  value={timeEstimate}
                  onChange={(e) => setTimeEstimate(e.target.value)}
                  placeholder="30m"
                  className="w-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPriority('high')} className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm ${priority === 'high' ? 'bg-red-500 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>🔴 High</button>
                <button type="button" onClick={() => setPriority('medium')} className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm ${priority === 'medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>🟡 Med</button>
                <button type="button" onClick={() => setPriority('low')} className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm ${priority === 'low' ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>🔵 Low</button>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowQuickAdd(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function KanbanColumn({ title, count, color, groups, onUpdate, onToggle, onDelete, onAdd, allCategories }) {
  const [dragOver, setDragOver] = useState(false)
  const dateLabels = {
    overdue: '⚠️ Overdue',
    today: '📅 Today',
    tomorrow: '📅 Tomorrow',
    later: '📅 Later',
    noDate: '📅 No Date'
  }

  const calculateColumnTime = () => {
    let totalMinutes = 0
    Object.values(groups).flat().forEach(todo => {
      if (todo.timeEstimate) {
        const time = todo.timeEstimate.toLowerCase()
        if (time.includes('h')) {
          totalMinutes += parseFloat(time) * 60
        } else if (time.includes('m')) {
          totalMinutes += parseFloat(time)
        }
      }
    })
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return null
  }

  const columnTime = calculateColumnTime()

  const getStatusFromTitle = (title) => {
    if (title.includes('Backlog')) return 'backlog'
    if (title.includes('Progress')) return 'in-progress'
    if (title.includes('Completed')) return 'completed'
    return 'backlog'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const todoId = e.dataTransfer.getData('todoId')
    const todoData = e.dataTransfer.getData('todoData')
    if (todoId && todoData) {
      const todo = JSON.parse(todoData)
      const newStatus = getStatusFromTitle(title)
      onUpdate({
        ...todo,
        status: newStatus,
        completed: newStatus === 'completed',
        startedAt: newStatus === 'in-progress' && !todo.startedAt ? new Date().toISOString() : todo.startedAt,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      })
    }
  }

  return (
    <div 
      className={`bg-slate-50 dark:bg-gray-900/50 rounded-xl p-3 min-h-[400px] transition-all ${
        dragOver ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`bg-gradient-to-r ${color} rounded-lg px-4 py-3 mb-3 shadow-md`}>
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{count}</span>
            {columnTime && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">⏱️ {columnTime}</span>
            )}
          </div>
        </h3>
      </div>
      <div className="space-y-3">
        {Object.entries(groups).map(([dateKey, todos]) => (
          todos.length > 0 && (
            <div key={dateKey}>
              <h4 className={`text-xs font-semibold px-2 py-1 mb-2 rounded ${
                dateKey === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-slate-400'
              }`}>
                {dateLabels[dateKey]} ({todos.length})
              </h4>
              <div className="space-y-2">
                {todos.map(todo => (
                  <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} onAdd={onAdd} allCategories={allCategories} />
                ))}
              </div>
            </div>
          )
        ))}
        {count === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}

function TodoItem({ todo, onToggle, onDelete, onUpdate, onAdd, allCategories }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editDate, setEditDate] = useState(todo.dueDate || '')
  const [editCategory, setEditCategory] = useState(todo.category)
  const [editPriority, setEditPriority] = useState(todo.priority || 'medium')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [editTimeEstimate, setEditTimeEstimate] = useState(todo.timeEstimate || '')
  const category = allCategories.find(c => c.id === todo.category) || allCategories.find(c => c.id === 'other') || allCategories[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = todo.dueDate ? new Date(todo.dueDate + 'T00:00:00') : null
  const isOverdue = dueDate && dueDate < today && !todo.completed

  const handleUpdate = () => {
    if (!editText.trim()) return
    onUpdate({ ...todo, text: editText.trim(), dueDate: editDate || null, category: editCategory, priority: editPriority, timeEstimate: editTimeEstimate || null })
    setIsEditing(false)
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    const subtasks = todo.subtasks || []
    onUpdate({ ...todo, subtasks: [...subtasks, { id: Date.now(), text: newSubtask.trim(), completed: false }] })
    setNewSubtask('')
  }

  const toggleSubtask = (subtaskId) => {
    const subtasks = (todo.subtasks || []).map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    onUpdate({ ...todo, subtasks })
  }

  const deleteSubtask = (subtaskId) => {
    const subtasks = (todo.subtasks || []).filter(st => st.id !== subtaskId)
    onUpdate({ ...todo, subtasks })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUpdate()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-indigo-300 dark:border-indigo-700 p-3 sm:p-4">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          autoFocus
        />
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <input
            type="text"
            value={editTimeEstimate}
            onChange={(e) => setEditTimeEstimate(e.target.value)}
            placeholder="30m"
            className="w-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {allCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setEditPriority('high')}
            className={`flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              editPriority === 'high'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}
          >
            🔴 High
          </button>
          <button
            type="button"
            onClick={() => setEditPriority('medium')}
            className={`flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              editPriority === 'medium'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}
          >
            🟡 Medium
          </button>
          <button
            type="button"
            onClick={() => setEditPriority('low')}
            className={`flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              editPriority === 'low'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}
          >
            🔵 Low
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleUpdate} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="flex-1 px-3 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const currentStatus = todo.status || (todo.completed ? 'completed' : 'backlog')
  
  const moveToStatus = (newStatus) => {
    onUpdate({ 
      ...todo, 
      status: newStatus,
      completed: newStatus === 'completed',
      startedAt: newStatus === 'in-progress' && !todo.startedAt ? new Date().toISOString() : todo.startedAt,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : null
    })
    
    if (newStatus === 'completed' && todo.isRecurring) {
      createNextRecurrence()
    }
  }

  const createNextRecurrence = () => {
    const getNextDate = () => {
      const today = new Date()
      if (todo.recurringPattern === 'daily') {
        today.setDate(today.getDate() + 1)
      } else if (todo.recurringPattern === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const targetDay = days.indexOf(todo.recurringDay)
        const currentDay = today.getDay()
        const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7
        today.setDate(today.getDate() + daysUntilNext)
      } else if (todo.recurringPattern === 'monthly') {
        today.setMonth(today.getMonth() + 1)
        today.setDate(1)
      }
      return today.toISOString().split('T')[0]
    }

    const newTodo = {
      ...todo,
      id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      status: 'backlog',
      completed: false,
      dueDate: getNextDate(),
      completedAt: null,
      startedAt: null,
      subtasks: (todo.subtasks || []).map(st => ({ ...st, completed: false })),
      createdAt: new Date().toISOString()
    }
    
    setTimeout(() => onAdd(newTodo), 500)
  }

  const handleDragStart = (e) => {
    e.dataTransfer.setData('todoId', todo.id)
    e.dataTransfer.setData('todoData', JSON.stringify(todo))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <>
    <div 
      draggable={window.innerWidth >= 1024}
      onDragStart={handleDragStart}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-3 transition-all hover:shadow-md lg:cursor-move ${
      currentStatus === 'completed' ? 'opacity-60' : ''
    } ${isOverdue ? 'border-red-300 dark:border-red-700' : ''}`}>
      <div className="flex items-start gap-2">
        <button
          onClick={() => moveToStatus(currentStatus === 'completed' ? 'in-progress' : 'completed')}
          className={`flex-shrink-0 w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
            currentStatus === 'completed'
              ? `${category.color} border-transparent`
              : 'border-slate-300 dark:border-gray-600 hover:border-indigo-500'
          }`}
          aria-label={currentStatus === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {currentStatus === 'completed' && <Check className="w-3 h-3 sm:w-3 sm:h-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${
            currentStatus === 'completed'
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-white'
          }`}>
            {todo.text}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${category.lightBg} text-slate-700 dark:text-slate-300`}>
              {category.name}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              todo.priority === 'high' ? 'bg-red-500 text-white' :
              todo.priority === 'medium' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}>
              {todo.priority === 'high' ? '🔴 High' : todo.priority === 'medium' ? '🟡 Med' : '🔵 Low'}
            </span>
            {todo.dueDate && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${
                isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-400'
              }`}>
                {isOverdue && '⚠️'}
                {new Date(todo.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {todo.timeEstimate && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                ⏱️ {todo.timeEstimate}
              </span>
            )}
            {todo.isRecurring && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
                🔄 {todo.recurringPattern === 'daily' ? 'Daily' : todo.recurringPattern === 'weekly' ? `Every ${todo.recurringDay}` : '1st of month'}
              </span>
            )}
            {todo.subtasks && todo.subtasks.length > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50"
              >
                ☑️ {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length}
              </button>
            )}
          </div>
          
          {/* Subtasks */}
          {showSubtasks && todo.subtasks && todo.subtasks.length > 0 && (
            <div className="mt-2 space-y-1 pl-6 border-l-2 border-purple-200 dark:border-purple-800">
              {todo.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSubtask(subtask.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      subtask.completed ? 'bg-purple-500 border-purple-500' : 'border-slate-300 dark:border-gray-600'
                    }`}
                  >
                    {subtask.completed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`text-xs flex-1 ${
                    subtask.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {subtask.text}
                  </span>
                  <button onClick={() => deleteSubtask(subtask.id)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Subtask */}
          {showSubtasks && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                placeholder="Add subtask..."
                className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button onClick={addSubtask} className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600">
                Add
              </button>
            </div>
          )}
          
          {!showSubtasks && (
            <button
              onClick={() => setShowSubtasks(true)}
              className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              + Add subtask
            </button>
          )}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-shrink-0 text-slate-400 hover:text-indigo-500 transition-colors p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Delete task"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    {/* Delete Confirmation */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDeleteConfirm(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Task?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Are you sure you want to delete "{todo.text}"? This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDelete(todo.id)
                setShowDeleteConfirm(false)
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
