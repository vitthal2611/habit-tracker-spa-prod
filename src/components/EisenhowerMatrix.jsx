import { useState } from 'react'
import { Plus, X, Check, Edit2, CheckCircle2, ArrowRight } from 'lucide-react'

export default function EisenhowerMatrix({ todos, onAdd, onToggle, onDelete, onUpdate, allCategories }) {
  const [newTodo, setNewTodo] = useState('')
  const [selectedQuadrant, setSelectedQuadrant] = useState('urgent-important')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  // Categorize todos into quadrants
  const getQuadrant = (todo) => {
    const isUrgent = todo.priority === 'high' || todo.dueDate
    const isImportant = todo.category === 'work' || todo.category === 'health' || todo.priority !== 'low'
    
    if (isUrgent && isImportant) return 'urgent-important'
    if (!isUrgent && isImportant) return 'not-urgent-important'
    if (isUrgent && !isImportant) return 'urgent-not-important'
    return 'not-urgent-not-important'
  }

  const activeTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  const quadrants = {
    'urgent-important': activeTodos.filter(t => (t.quadrant || getQuadrant(t)) === 'urgent-important'),
    'not-urgent-important': activeTodos.filter(t => (t.quadrant || getQuadrant(t)) === 'not-urgent-important'),
    'urgent-not-important': activeTodos.filter(t => (t.quadrant || getQuadrant(t)) === 'urgent-not-important'),
    'not-urgent-not-important': activeTodos.filter(t => (t.quadrant || getQuadrant(t)) === 'not-urgent-not-important')
  }

  const moveToQuadrant = async (todoId, newQuadrant) => {
    const todo = todos.find(t => t.id === todoId)
    if (todo) {
      await onUpdate({ ...todo, quadrant: newQuadrant })
    }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (newTodo.trim()) {
      const priority = selectedQuadrant.includes('urgent') ? 'high' : 'medium'
      onAdd({
        id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        text: newTodo.trim(),
        category: 'personal',
        completed: false,
        status: 'backlog',
        priority,
        quadrant: selectedQuadrant,
        createdAt: new Date().toISOString()
      })
      setNewTodo('')
      setShowAddForm(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Eisenhower Priority Matrix</h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Organize tasks by urgency and importance</p>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Q1: Urgent & Important - DO FIRST */}
        <MatrixQuadrant
          title="DO FIRST"
          subtitle="Urgent & Important"
          color="from-red-500 to-orange-500"
          bgColor="bg-red-50 dark:bg-red-950/20"
          borderColor="border-red-300 dark:border-red-700"
          icon="🔥"
          quadrantId="urgent-important"
          todos={quadrants['urgent-important']}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onMove={moveToQuadrant}
          onAdd={onAdd}
          allCategories={allCategories}
        />

        {/* Q2: Not Urgent & Important - SCHEDULE */}
        <MatrixQuadrant
          title="SCHEDULE"
          subtitle="Not Urgent & Important"
          color="from-blue-500 to-indigo-500"
          bgColor="bg-blue-50 dark:bg-blue-950/20"
          borderColor="border-blue-300 dark:border-blue-700"
          icon="📅"
          quadrantId="not-urgent-important"
          todos={quadrants['not-urgent-important']}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onMove={moveToQuadrant}
          onAdd={onAdd}
          allCategories={allCategories}
        />

        {/* Q3: Urgent & Not Important - DELEGATE */}
        <MatrixQuadrant
          title="DELEGATE"
          subtitle="Urgent & Not Important"
          color="from-yellow-500 to-amber-500"
          bgColor="bg-yellow-50 dark:bg-yellow-950/20"
          borderColor="border-yellow-300 dark:border-yellow-700"
          icon="👥"
          quadrantId="urgent-not-important"
          todos={quadrants['urgent-not-important']}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onMove={moveToQuadrant}
          onAdd={onAdd}
          allCategories={allCategories}
        />

        {/* Q4: Not Urgent & Not Important - ELIMINATE */}
        <MatrixQuadrant
          title="ELIMINATE"
          subtitle="Not Urgent & Not Important"
          color="from-gray-500 to-slate-500"
          bgColor="bg-gray-50 dark:bg-gray-900/50"
          borderColor="border-gray-300 dark:border-gray-700"
          icon="🗑️"
          quadrantId="not-urgent-not-important"
          todos={quadrants['not-urgent-not-important']}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onMove={moveToQuadrant}
          onAdd={onAdd}
          allCategories={allCategories}
        />
      </div>

      {/* Completed Tasks Section */}
      {completedTodos.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border-2 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-950/30 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm sm:text-base font-bold text-green-900 dark:text-green-100">Completed Tasks</span>
              <span className="bg-green-200 dark:bg-green-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold text-green-900 dark:text-green-100">{completedTodos.length}</span>
            </div>
            <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 transition-transform ${showCompleted ? 'rotate-90' : ''}`} />
          </button>
          {showCompleted && (
            <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
              {completedTodos.map(todo => (
                <CompletedTodoCard key={todo.id} todo={todo} onDelete={onDelete} allCategories={allCategories} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 hover:scale-110"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Task</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Quadrant</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuadrant('urgent-important')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedQuadrant === 'urgent-important'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">🔥</div>
                    <div className="text-xs font-bold">DO FIRST</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuadrant('not-urgent-important')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedQuadrant === 'not-urgent-important'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">📅</div>
                    <div className="text-xs font-bold">SCHEDULE</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuadrant('urgent-not-important')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedQuadrant === 'urgent-not-important'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">👥</div>
                    <div className="text-xs font-bold">DELEGATE</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuadrant('not-urgent-not-important')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedQuadrant === 'not-urgent-not-important'
                        ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/50'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">🗑️</div>
                    <div className="text-xs font-bold">ELIMINATE</div>
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
                >
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

function MatrixQuadrant({ title, subtitle, color, bgColor, borderColor, icon, quadrantId, todos, onToggle, onDelete, onUpdate, onMove, onAdd, allCategories }) {
  const [quickAdd, setQuickAdd] = useState('')

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (quickAdd.trim()) {
      onAdd({
        id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        text: quickAdd.trim(),
        category: 'personal',
        completed: false,
        quadrant: quadrantId,
        createdAt: new Date().toISOString()
      })
      setQuickAdd('')
    }
  }

  return (
    <div className={`${bgColor} rounded-xl border-2 ${borderColor} p-3 sm:p-4 min-h-[250px] sm:min-h-[300px]`}>
      <div className={`bg-gradient-to-r ${color} rounded-lg px-3 py-2 sm:px-4 sm:py-3 mb-2 sm:mb-3 shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl">{icon}</span>
              <h3 className="text-sm sm:text-lg font-bold text-white truncate">{title}</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 sm:mt-1 truncate">{subtitle}</p>
          </div>
          <span className="bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold text-white ml-2">{todos.length}</span>
        </div>
      </div>
      <form onSubmit={handleQuickAdd} className="mb-2 sm:mb-3">
        <input
          type="text"
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          placeholder="+ Add task..."
          className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </form>
      <div className="space-y-1.5 sm:space-y-2">
        {todos.map(todo => (
          <TodoCard key={todo.id} todo={todo} currentQuadrant={quadrantId} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} onMove={onMove} allCategories={allCategories} />
        ))}
        {todos.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-gray-400 dark:text-gray-600 text-xs sm:text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}

function TodoCard({ todo, currentQuadrant, onToggle, onDelete, onUpdate, onMove, allCategories }) {
  const [showDelete, setShowDelete] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const category = allCategories?.find(c => c.id === todo.category) || { name: 'Task', color: 'bg-gray-500' }

  const quadrantOptions = [
    { id: 'urgent-important', label: '🔥 DO FIRST', color: 'text-red-600' },
    { id: 'not-urgent-important', label: '📅 SCHEDULE', color: 'text-blue-600' },
    { id: 'urgent-not-important', label: '👥 DELEGATE', color: 'text-yellow-600' },
    { id: 'not-urgent-not-important', label: '🗑️ ELIMINATE', color: 'text-gray-600' }
  ].filter(q => q.id !== currentQuadrant)

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-3 hover:shadow-md transition-all group">
        <div className="flex items-start gap-2">
          <button
            onClick={() => onToggle(todo.id)}
            className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 flex items-center justify-center transition-all mt-0.5"
          >
            {todo.completed && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white leading-snug">{todo.text}</p>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${category.color} text-white`}>
                {category.name}
              </span>
              {todo.dueDate && (
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  {new Date(todo.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMoveMenu(true)}
              className="flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors p-1"
              title="Move to another quadrant"
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Move Menu */}
      {showMoveMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowMoveMenu(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Move Task</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Move "{todo.text}" to:</p>
            <div className="space-y-2">
              {quadrantOptions.map(q => (
                <button
                  key={q.id}
                  onClick={() => {
                    onMove(todo.id, q.id)
                    setShowMoveMenu(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all ${q.color}`}
                >
                  <span className="font-medium">{q.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoveMenu(false)}
              className="w-full mt-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDelete(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Task?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete "{todo.text}"?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(todo.id)
                  setShowDelete(false)
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-semibold"
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

function CompletedTodoCard({ todo, onDelete, allCategories }) {
  const [showDelete, setShowDelete] = useState(false)
  const category = allCategories?.find(c => c.id === todo.category) || { name: 'Task', color: 'bg-gray-500' }

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 line-through leading-snug">{todo.text}</p>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${category.color} text-white opacity-60`}>
                {category.name}
              </span>
              {todo.completedAt && (
                <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                  {new Date(todo.completedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDelete(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Completed Task?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete "{todo.text}"?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(todo.id)
                  setShowDelete(false)
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-semibold"
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
