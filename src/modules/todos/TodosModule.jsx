import { useState } from 'react'
import TodoList from './components/TodoList'
import TaskTemplates from './components/TaskTemplates'
import CalendarView from './components/CalendarView'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import Toast from '../../components/ui/Toast'
import Tooltip from '../../components/ui/Tooltip'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { Calendar, Sparkles } from 'lucide-react'

export default function TodosModule() {
  const [dbTodos, { addItem: addTodoToDb, updateItem: updateTodoInDb, deleteItem: deleteTodoFromDb, loading }] = useLocalStorage('todos', [])
  const [dbCategories, { addItem: addCategoryToDb, deleteItem: deleteCategoryFromDb }] = useLocalStorage('todoCategories', [])
  const [showTemplates, setShowTemplates] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  // Keyboard shortcuts
  useKeyboardShortcut('n', () => document.querySelector('[data-add-todo]')?.click(), { enabled: !showTemplates && !showCalendar })
  useKeyboardShortcut('t', () => setShowTemplates(true), { enabled: !showTemplates })

  const applyTemplate = async (tasks) => {
    for (const task of tasks) {
      await addTodoToDb({ ...task, id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`, completed: false, status: 'backlog', createdAt: new Date().toISOString() })
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    setShowTemplates(false)
    showToast('Template applied successfully!')
  }

  if (loading) return <Loading text="Loading tasks..." />

  return (
    <div className="animate-fade-in">
      <div className="flex gap-2 mb-4 px-4">
        <Tooltip text="Use pre-built task templates">
          <button onClick={() => setShowTemplates(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2" aria-label="Open templates">
            <Sparkles className="w-5 h-5" />Templates
          </button>
        </Tooltip>
        <Tooltip text="View tasks in calendar">
          <button onClick={() => setShowCalendar(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2" aria-label="Open calendar">
            <Calendar className="w-5 h-5" />Calendar
          </button>
        </Tooltip>
      </div>
      {dbTodos.length === 0 && !showTemplates && !showCalendar ? (
        <EmptyState type="todos" onAction={() => document.querySelector('[data-add-todo]')?.click()} actionLabel="Add Your First Task" />
      ) : (
        <TodoList 
        todos={dbTodos}
        categories={dbCategories}
        onAdd={async (todo) => {
          await addTodoToDb(todo)
          showToast('Task added!')
        }}
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
            showToast(newStatus === 'completed' ? 'Task completed!' : 'Task reopened')
          }
        }}
        onUpdate={async (todo) => {
          await updateTodoInDb(todo)
          showToast('Task updated!')
        }}
        onDelete={async (id) => {
          await deleteTodoFromDb(id)
          showToast('Task deleted!')
        }}
        onAddCategory={async (category) => {
          await addCategoryToDb({ ...category, id: category.id, createdAt: new Date().toISOString() })
          showToast('Category added!')
        }}
        onDeleteCategory={async (id) => {
          await deleteCategoryFromDb(id)
          showToast('Category deleted!')
        }}
        />
      )}
      {showTemplates && (
        <TaskTemplates onApply={applyTemplate} onClose={() => setShowTemplates(false)} />
      )}
      {showCalendar && (
        <CalendarView todos={dbTodos} onClose={() => setShowCalendar(false)} onUpdate={updateTodoInDb} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
