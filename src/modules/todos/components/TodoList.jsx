import { useState, useEffect } from 'react'
import { Plus, X, Check, Circle, Edit2, Calendar, Search, Filter, Tag, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import QuickAddBottomSheet from './QuickAddBottomSheet'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [newTag, setNewTag] = useState('')
  
  const allCategories = [...DEFAULT_CATEGORIES, ...(categories || [])]

  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [timeEstimate, setTimeEstimate] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPattern, setRecurringPattern] = useState('daily')
  const [recurringDay, setRecurringDay] = useState('Mon')
  const [recurringStartDate, setRecurringStartDate] = useState('')
  const [recurringEndDate, setRecurringEndDate] = useState('')

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
          tags: selectedTags,
          isRecurring: isRecurring,
          recurringPattern: isRecurring ? recurringPattern : null,
          recurringDay: isRecurring && recurringPattern === 'weekly' ? recurringDay : null,
          recurringStartDate: isRecurring ? recurringStartDate : null,
          recurringEndDate: isRecurring ? recurringEndDate : null,
          createdAt: new Date().toISOString()
        })
        setNewTodo('')
        setDueDate('')
        setPriority('medium')
        setTimeEstimate('')
        setSelectedTags([])
        setIsRecurring(false)
        setRecurringPattern('daily')
        setRecurringStartDate('')
        setRecurringEndDate('')
        setAddSuccess(true)
        setTimeout(() => setAddSuccess(false), 2000)
        setShowQuickAdd(false)
      } catch (err) {
        console.error('Error adding todo:', err)
      }
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filterCategory !== 'all' && todo.category !== filterCategory) return false
    if (filterStatus !== 'all') {
      const status = todo.status || (todo.completed ? 'completed' : 'backlog')
      if (status !== filterStatus) return false
    }
    if (filterPriority !== 'all' && todo.priority !== filterPriority) return false
    if (filterDateRange.start && todo.dueDate && todo.dueDate < filterDateRange.start) return false
    if (filterDateRange.end && todo.dueDate && todo.dueDate > filterDateRange.end) return false
    if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  // Calculate quadrant for each todo
  const calculateQuadrant = (todo) => {
    if (todo.quadrant) return todo.quadrant
    const today = new Date().toISOString().split('T')[0]
    const dueDate = todo.dueDate
    const priority = todo.priority || 'medium'
    
    const isUrgent = dueDate && dueDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const isImportant = priority === 'high'
    
    if (isImportant && isUrgent) return 'Q1'
    if (isImportant && !isUrgent) return 'Q2'
    if (!isImportant && isUrgent) return 'Q3'
    return 'Q4'
  }

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

  // Eisenhower Matrix Quadrants
  const q1Todos = sortedTodos.filter(t => !t.completed && calculateQuadrant(t) === 'Q1')
  const q2Todos = sortedTodos.filter(t => !t.completed && calculateQuadrant(t) === 'Q2')
  const q3Todos = sortedTodos.filter(t => !t.completed && calculateQuadrant(t) === 'Q3')
  const q4Todos = sortedTodos.filter(t => !t.completed && calculateQuadrant(t) === 'Q4')
  completedTodos = sortedTodos.filter(t => t.completed || t.status === 'completed')

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
        totalMinutes += parseFloat(todo.timeEstimate) || 0
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

  const getTaskStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const total = todos.length
    const completed = todos.filter(t => t.completed || t.status === 'completed').length
    const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < today).length
    const todayCount = todos.filter(t => t.dueDate === today && !t.completed).length
    return { total, completed, overdue, today: todayCount }
  }

  const stats = getTaskStats()

  const allTags = [...new Set(todos.flatMap(t => t.tags || []))]

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

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
      {/* Task Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Circle className="w-5 h-5 opacity-80" />
            <span className="text-2xl font-black">{stats.total}</span>
          </div>
          <p className="text-xs font-semibold opacity-90">Total Tasks</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Check className="w-5 h-5 opacity-80" />
            <span className="text-2xl font-black">{stats.completed}</span>
          </div>
          <p className="text-xs font-semibold opacity-90">Completed</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 opacity-80" />
            <span className="text-2xl font-black">{stats.overdue}</span>
          </div>
          <p className="text-xs font-semibold opacity-90">Overdue</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 opacity-80" />
            <span className="text-2xl font-black">{stats.today}</span>
          </div>
          <p className="text-xs font-semibold opacity-90">Due Today</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${showFilters ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300'}`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-gray-700 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Status</option>
                <option value="backlog">Backlog</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Priority</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date Range</label>
              <div className="flex gap-1">
                <input type="date" value={filterDateRange.start} onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})} className="flex-1 px-2 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="date" value={filterDateRange.end} onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})} className="flex-1 px-2 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">Add New Task</h2>
        
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
                type="number"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
                placeholder="30"
                min="1"
                className="w-16 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="submit"
                data-add-todo
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
            <>
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
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={recurringStartDate}
                    onChange={(e) => setRecurringStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    min={recurringStartDate}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </>
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

          {/* Tags Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 font-semibold text-sm">
                Add
              </button>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Suggestions:</span>
                {allTags.filter(t => !selectedTags.includes(t)).slice(0, 5).map(tag => (
                  <button key={tag} type="button" onClick={() => setSelectedTags([...selectedTags, tag])} className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-600">
                    + {tag}
                  </button>
                ))}
              </div>
            )}
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

      {/* Eisenhower Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Q1: DO - Important & Urgent */}
        <MatrixQuadrant
          title="DO NOW"
          subtitle="Important & Urgent"
          icon="🔥"
          count={q1Todos.length}
          color="from-red-500 to-red-600"
          bgColor="bg-red-50 dark:bg-red-900/20"
          borderColor="border-red-300 dark:border-red-700"
          todos={q1Todos}
          quadrant="Q1"
          action="Start Now"
          actionColor="bg-red-500 hover:bg-red-600"
          onUpdate={onUpdate}
          onToggle={onToggle}
          onDelete={onDelete}
          onAdd={onAdd}
          allCategories={allCategories}
          calculateQuadrant={calculateQuadrant}
        />

        {/* Q2: SCHEDULE - Important & Not Urgent */}
        <MatrixQuadrant
          title="SCHEDULE"
          subtitle="Important & Not Urgent"
          icon="📅"
          count={q2Todos.length}
          color="from-blue-500 to-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          borderColor="border-blue-300 dark:border-blue-700"
          todos={q2Todos}
          quadrant="Q2"
          action="Schedule"
          actionColor="bg-blue-500 hover:bg-blue-600"
          onUpdate={onUpdate}
          onToggle={onToggle}
          onDelete={onDelete}
          onAdd={onAdd}
          allCategories={allCategories}
          calculateQuadrant={calculateQuadrant}
        />

        {/* Q3: DELEGATE - Not Important & Urgent */}
        <MatrixQuadrant
          title="DELEGATE"
          subtitle="Not Important & Urgent"
          icon="👥"
          count={q3Todos.length}
          color="from-yellow-500 to-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
          borderColor="border-yellow-300 dark:border-yellow-700"
          todos={q3Todos}
          quadrant="Q3"
          action="Delegate"
          actionColor="bg-yellow-500 hover:bg-yellow-600"
          onUpdate={onUpdate}
          onToggle={onToggle}
          onDelete={onDelete}
          onAdd={onAdd}
          allCategories={allCategories}
          calculateQuadrant={calculateQuadrant}
        />

        {/* Q4: ELIMINATE - Not Important & Not Urgent */}
        <MatrixQuadrant
          title="ELIMINATE"
          subtitle="Not Important & Not Urgent"
          icon="🗑️"
          count={q4Todos.length}
          color="from-gray-500 to-gray-600"
          bgColor="bg-gray-50 dark:bg-gray-900/20"
          borderColor="border-gray-300 dark:border-gray-700"
          todos={q4Todos}
          quadrant="Q4"
          action="Delete"
          actionColor="bg-gray-500 hover:bg-gray-600"
          onUpdate={onUpdate}
          onToggle={onToggle}
          onDelete={onDelete}
          onAdd={onAdd}
          allCategories={allCategories}
          calculateQuadrant={calculateQuadrant}
        />
      </div>

      {/* Completed Tasks Section */}
      {completedTodos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Completed Tasks ({completedTodos.length})
          </h3>
          <div className="space-y-2">
            {completedTodos.slice(0, 5).map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} onAdd={onAdd} allCategories={allCategories} />
            ))}
          </div>
          {completedTodos.length > 5 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
              +{completedTodos.length - 5} more completed tasks
            </p>
          )}
        </div>
      )}

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
        onClick={() => {
          navigator.vibrate?.(10)
          setShowQuickAdd(true)
        }}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        title="Quick Add Task"
        aria-label="Quick Add Task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Quick Add Bottom Sheet */}
      {showQuickAdd && (
        <QuickAddBottomSheet
          onAdd={onAdd}
          onClose={() => setShowQuickAdd(false)}
          allCategories={allCategories}
        />
      )}
    </div>
  )
}

function MatrixQuadrant({ title, subtitle, icon, count, color, bgColor, borderColor, todos, quadrant, action, actionColor, onUpdate, onToggle, onDelete, onAdd, allCategories, calculateQuadrant }) {
  const [showDelegateModal, setShowDelegateModal] = useState(false)
  const [delegateEmail, setDelegateEmail] = useState('')
  const [selectedTodo, setSelectedTodo] = useState(null)

  const handleDelegate = (todo) => {
    setSelectedTodo(todo)
    setShowDelegateModal(true)
  }

  const submitDelegate = () => {
    if (selectedTodo && delegateEmail.trim()) {
      onUpdate({ ...selectedTodo, delegatedTo: delegateEmail.trim() })
      setDelegateEmail('')
      setShowDelegateModal(false)
      setSelectedTodo(null)
    }
  }

  return (
    <>
    <div className={`${bgColor} rounded-xl border-2 ${borderColor} p-4 min-h-[300px]`}>
      <div className={`bg-gradient-to-r ${color} rounded-lg px-4 py-3 mb-4 shadow-md`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            {title}
          </h3>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold text-white">{count}</span>
        </div>
        <p className="text-xs text-white/90 font-medium">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {todos.map(todo => (
          <div key={todo.id} className="relative group">
            <TodoItem 
              todo={todo} 
              onToggle={onToggle} 
              onDelete={onDelete} 
              onUpdate={onUpdate} 
              onAdd={onAdd} 
              allCategories={allCategories}
              quadrant={quadrant}
            />
            {quadrant === 'Q1' && (
              <button
                onClick={() => onUpdate({ ...todo, status: 'in-progress', startedAt: new Date().toISOString() })}
                className={`mt-2 w-full px-3 py-2 ${actionColor} text-white rounded-lg font-semibold text-sm transition-all`}
              >
                ▶️ {action}
              </button>
            )}
            {quadrant === 'Q2' && (
              <button
                onClick={() => {
                  const scheduledDate = prompt('Schedule for date (YYYY-MM-DD):');
                  if (scheduledDate) onUpdate({ ...todo, dueDate: scheduledDate });
                }}
                className={`mt-2 w-full px-3 py-2 ${actionColor} text-white rounded-lg font-semibold text-sm transition-all`}
              >
                📅 {action}
              </button>
            )}
            {quadrant === 'Q3' && (
              <button
                onClick={() => handleDelegate(todo)}
                className={`mt-2 w-full px-3 py-2 ${actionColor} text-white rounded-lg font-semibold text-sm transition-all`}
              >
                👥 {action}
              </button>
            )}
            {quadrant === 'Q4' && (
              <button
                onClick={() => { if (confirm(`Delete "${todo.text}"?`)) onDelete(todo.id); }}
                className={`mt-2 w-full px-3 py-2 ${actionColor} text-white rounded-lg font-semibold text-sm transition-all`}
              >
                🗑️ {action}
              </button>
            )}
          </div>
        ))}
        {count === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
            No tasks in this quadrant
          </div>
        )}
      </div>
    </div>

    {/* Delegate Modal */}
    {showDelegateModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDelegateModal(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Delegate Task</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Delegate "{selectedTodo?.text}" to:
          </p>
          <input
            type="email"
            value={delegateEmail}
            onChange={(e) => setDelegateEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowDelegateModal(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={submitDelegate}
              className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 font-semibold"
            >
              Delegate
            </button>
          </div>
        </div>
      </div>
    )}
    </>
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
        totalMinutes += parseFloat(todo.timeEstimate) || 0
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
  const [editIsRecurring, setEditIsRecurring] = useState(todo.isRecurring || false)
  const [editRecurringPattern, setEditRecurringPattern] = useState(todo.recurringPattern || 'daily')
  const [editRecurringDay, setEditRecurringDay] = useState(todo.recurringDay || 'Mon')
  const [editRecurringStartDate, setEditRecurringStartDate] = useState(todo.recurringStartDate || '')
  const [editRecurringEndDate, setEditRecurringEndDate] = useState(todo.recurringEndDate || '')
  const [editTags, setEditTags] = useState(todo.tags || [])
  const [newEditTag, setNewEditTag] = useState('')
  const category = allCategories.find(c => c.id === todo.category) || allCategories.find(c => c.id === 'other') || allCategories[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = todo.dueDate ? new Date(todo.dueDate + 'T00:00:00') : null
  const isOverdue = dueDate && dueDate < today && !todo.completed

  const handleUpdate = () => {
    if (!editText.trim()) return
    onUpdate({ 
      ...todo, 
      text: editText.trim(), 
      dueDate: editDate || null, 
      category: editCategory, 
      priority: editPriority, 
      timeEstimate: editTimeEstimate || null,
      tags: editTags,
      isRecurring: editIsRecurring,
      recurringPattern: editIsRecurring ? editRecurringPattern : null,
      recurringDay: editIsRecurring && editRecurringPattern === 'weekly' ? editRecurringDay : null,
      recurringStartDate: editIsRecurring ? editRecurringStartDate : null,
      recurringEndDate: editIsRecurring ? editRecurringEndDate : null
    })
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

    const nextDate = getNextDate()
    
    // Check if next date is within recurrence range
    if (todo.recurringEndDate && nextDate > todo.recurringEndDate) {
      return // Don't create next recurrence if past end date
    }

    const newTodo = {
      ...todo,
      id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      status: 'backlog',
      completed: false,
      dueDate: nextDate,
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
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-3 transition-all hover:shadow-md hover:scale-[1.02] lg:cursor-move animate-fade-in ${
      currentStatus === 'completed' ? 'opacity-60' : ''
    } ${isOverdue ? 'border-red-300 dark:border-red-700 border-2' : ''}`}>
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
                ⏱️ {todo.timeEstimate}m
              </span>
            )}
            {todo.isRecurring && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
                🔄 {todo.recurringPattern === 'daily' ? 'Daily' : todo.recurringPattern === 'weekly' ? `Every ${todo.recurringDay}` : '1st of month'}
                {todo.recurringEndDate && ` until ${new Date(todo.recurringEndDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}`}
              </span>
            )}
            {todo.delegatedTo && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                👥 Delegated to: {todo.delegatedTo}
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
            {todo.tags && todo.tags.map(tag => (
              <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-400 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
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

    {/* Edit Modal */}
    {isEditing && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsEditing(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Task</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Name</label>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Task name..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time (min)</label>
                <input
                  type="number"
                  value={editTimeEstimate}
                  onChange={(e) => setEditTimeEstimate(e.target.value)}
                  placeholder="30"
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditPriority('high')}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
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
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    editPriority === 'medium'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}
                >
                  🟡 Med
                </button>
                <button
                  type="button"
                  onClick={() => setEditPriority('low')}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    editPriority === 'low'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}
                >
                  🔵 Low
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs font-semibold">
                    {tag}
                    <button type="button" onClick={() => setEditTags(editTags.filter(t => t !== tag))} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEditTag}
                  onChange={(e) => setNewEditTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (newEditTag.trim() && !editTags.includes(newEditTag.trim())) {
                        setEditTags([...editTags, newEditTag.trim()])
                        setNewEditTag('')
                      }
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newEditTag.trim() && !editTags.includes(newEditTag.trim())) {
                      setEditTags([...editTags, newEditTag.trim()])
                      setNewEditTag('')
                    }
                  }}
                  className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 font-semibold text-sm"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-recurring"
                checked={editIsRecurring}
                onChange={(e) => setEditIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="edit-recurring" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                🔄 Recurring Task
              </label>
            </div>
            {editIsRecurring && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pattern</label>
                  <div className="flex gap-2">
                    <select
                      value={editRecurringPattern}
                      onChange={(e) => setEditRecurringPattern(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {editRecurringPattern === 'weekly' && (
                      <select
                        value={editRecurringDay}
                        onChange={(e) => setEditRecurringDay(e.target.value)}
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
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editRecurringStartDate}
                      onChange={(e) => setEditRecurringStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={editRecurringEndDate}
                      onChange={(e) => setEditRecurringEndDate(e.target.value)}
                      min={editRecurringStartDate}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

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
