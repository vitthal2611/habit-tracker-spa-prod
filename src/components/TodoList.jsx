import { useState, useEffect } from 'react'
import { Plus, X, Check, Circle } from 'lucide-react'

const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Work', color: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'personal', name: 'Personal', color: 'bg-purple-500', lightBg: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'health', name: 'Health', color: 'bg-green-500', lightBg: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'learning', name: 'Learning', color: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'other', name: 'Other', color: 'bg-slate-500', lightBg: 'bg-slate-50 dark:bg-slate-900/20' }
]

const COLORS = [
  { color: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-900/20' },
  { color: 'bg-purple-500', lightBg: 'bg-purple-50 dark:bg-purple-900/20' },
  { color: 'bg-green-500', lightBg: 'bg-green-50 dark:bg-green-900/20' },
  { color: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-900/20' },
  { color: 'bg-red-500', lightBg: 'bg-red-50 dark:bg-red-900/20' },
  { color: 'bg-pink-500', lightBg: 'bg-pink-50 dark:bg-pink-900/20' },
  { color: 'bg-indigo-500', lightBg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { color: 'bg-teal-500', lightBg: 'bg-teal-50 dark:bg-teal-900/20' },
  { color: 'bg-orange-500', lightBg: 'bg-orange-50 dark:bg-orange-900/20' },
  { color: 'bg-slate-500', lightBg: 'bg-slate-50 dark:bg-slate-900/20' }
]

export default function TodoList({ todos, onAdd, onToggle, onDelete, categories, onAddCategory, onDeleteCategory }) {
  const [newTodo, setNewTodo] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('personal')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)
  
  const allCategories = [...DEFAULT_CATEGORIES, ...(categories || [])]

  const handleAdd = async (e) => {
    e.preventDefault()
    if (newTodo.trim()) {
      const todoId = `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      try {
        await onAdd({
          id: todoId,
          text: newTodo.trim(),
          category: selectedCategory,
          completed: false,
          createdAt: new Date().toISOString()
        })
        setNewTodo('')
      } catch (err) {
        console.error('Error adding todo:', err)
        alert('Failed to add task. Please try again.')
      }
    }
  }

  const filteredTodos = filterCategory === 'all' 
    ? todos 
    : todos.filter(todo => todo.category === filterCategory)

  const activeTodos = filteredTodos.filter(t => !t.completed)
  const completedTodos = filteredTodos.filter(t => t.completed)

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">To-Do List</h2>
        
        {/* Add Todo Form */}
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

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
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
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
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
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
                onAddCategory({
                  id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category Name</label>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
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

      {/* Active Todos */}
      {activeTodos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 px-2">Active Tasks</h3>
          {activeTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} allCategories={allCategories} />
          ))}
        </div>
      )}

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 px-2">Completed</h3>
          {completedTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} allCategories={allCategories} />
          ))}
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
    </div>
  )
}

function TodoItem({ todo, onToggle, onDelete, allCategories }) {
  const category = allCategories.find(c => c.id === todo.category) || allCategories[4]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-3 sm:p-4 transition-all hover:shadow-md ${
      todo.completed ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? `${category.color} border-transparent`
              : 'border-slate-300 dark:border-gray-600 hover:border-indigo-500'
          }`}
        >
          {todo.completed && <Check className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm sm:text-base font-medium leading-snug ${
            todo.completed
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-white'
          }`}>
            {todo.text}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${category.lightBg} text-slate-700 dark:text-slate-300`}>
              {category.name}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(todo.id)}
          className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
