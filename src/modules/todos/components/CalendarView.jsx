import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function CalendarView({ todos, onClose, onUpdate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  
  const getTasksForDate = (day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return todos.filter(t => t.dueDate === dateStr)
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar View</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-sm text-slate-600 dark:text-slate-400 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const tasks = getTasksForDate(day)
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
              return (
                <div key={day} className={`aspect-square border rounded-lg p-2 ${isToday ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-gray-700'}`}>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{day}</div>
                  <div className="space-y-1">
                    {tasks.slice(0, 2).map(task => (
                      <div key={task.id} className="text-xs truncate bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1 rounded">
                        {task.text}
                      </div>
                    ))}
                    {tasks.length > 2 && (
                      <div className="text-xs text-slate-500">+{tasks.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
