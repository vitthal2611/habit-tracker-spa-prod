import { useState, useEffect } from 'react'
import { Plus, X, ChevronDown, Tag } from 'lucide-react'

export default function QuickAddBottomSheet({ onAdd, onClose, allCategories }) {
  const [taskText, setTaskText] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [timeEstimate, setTimeEstimate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('personal')
  const [selectedTags, setSelectedTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPattern, setRecurringPattern] = useState('daily')
  const [recurringDay, setRecurringDay] = useState('Mon')

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!taskText.trim()) return

    navigator.vibrate?.(10)

    await onAdd({
      id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      text: taskText.trim(),
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
      recurringStartDate: isRecurring ? dueDate : null,
      recurringEndDate: null,
      createdAt: new Date().toISOString()
    })

    onClose()
  }

  const incrementTime = () => {
    const current = parseInt(timeEstimate) || 0
    setTimeEstimate(String(current + 15))
  }

  const decrementTime = () => {
    const current = parseInt(timeEstimate) || 0
    if (current > 0) setTimeEstimate(String(Math.max(0, current - 15)))
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Swipe indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Add Task</h3>
          <button 
            onClick={onClose}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Main input */}
          <div>
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full min-h-[48px] px-4 py-3 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* Add Task button */}
          <button
            type="submit"
            disabled={!taskText.trim()}
            className="w-full min-h-[52px] px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-base"
          >
            Add Task
          </button>

          {/* Add Details toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline"
          >
            {showAdvanced ? 'Hide Details' : 'Add Details'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {/* Advanced fields */}
          <div className={`space-y-4 overflow-hidden transition-all duration-300 ${
            showAdvanced ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {/* Priority buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`min-h-[48px] px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    priority === 'high'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  🔴 High
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`min-h-[48px] px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    priority === 'medium'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}
                >
                  🟡 Medium
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`min-h-[48px] px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    priority === 'low'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}
                >
                  🔵 Low
                </button>
              </div>
            </div>

            {/* Date picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Time estimate with +/- buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Estimate (minutes)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={decrementTime}
                  className="min-w-[48px] min-h-[48px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
                >
                  −
                </button>
                <input
                  type="number"
                  value={timeEstimate}
                  onChange={(e) => setTimeEstimate(e.target.value)}
                  placeholder="30"
                  min="0"
                  className="flex-1 min-h-[48px] px-4 py-3 text-[16px] text-center bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={incrementTime}
                  className="min-w-[48px] min-h-[48px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Category chips */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {allCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 min-h-[48px] px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? `${cat.color} text-white shadow-md`
                        : `${cat.lightBg} text-gray-700 dark:text-gray-300`
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-semibold">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} 
                      className="hover:text-red-500"
                    >
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
                        setSelectedTags([...selectedTags, newTag.trim()])
                        setNewTag('')
                      }
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 min-h-[48px] px-4 py-3 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                />
                <button 
                  type="button" 
                  onClick={() => {
                    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
                      setSelectedTags([...selectedTags, newTag.trim()])
                      setNewTag('')
                    }
                  }}
                  className="min-w-[48px] min-h-[48px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 active:scale-95"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Recurring toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="recurring" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🔄 Recurring Task
                </label>
              </div>

              {isRecurring && (
                <div className="flex gap-2">
                  <select
                    value={recurringPattern}
                    onChange={(e) => setRecurringPattern(e.target.value)}
                    className="flex-1 min-h-[48px] px-4 py-3 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {recurringPattern === 'weekly' && (
                    <select
                      value={recurringDay}
                      onChange={(e) => setRecurringDay(e.target.value)}
                      className="flex-1 min-h-[48px] px-4 py-3 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
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
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
