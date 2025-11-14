import { useState } from 'react'
import { Plus, Check, X } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import Modal from './ui/Modal'

export default function TaskView() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Morning workout', types: ['daily'], priority: 'high', completed: false },
    { id: 2, text: 'Check emails', types: ['daily'], priority: 'medium', completed: false },
    { id: 3, text: 'Team meeting', types: ['weekly'], priority: 'high', completed: false },
    { id: 4, text: 'Grocery shopping', types: ['weekly'], priority: 'medium', completed: false },
    { id: 5, text: 'Read book', types: ['daily'], priority: 'low', completed: false },
    { id: 6, text: 'Monthly report', types: ['monthly'], priority: 'high', completed: false },
    { id: 7, text: 'Call dentist', types: ['daily'], priority: 'medium', completed: false },
    { id: 8, text: 'Plan vacation', types: ['monthly'], priority: 'low', completed: false },
    { id: 9, text: 'Water plants', types: ['weekly'], priority: 'low', completed: false },
    { id: 10, text: 'Review budget', types: ['monthly'], priority: 'medium', completed: false }
  ])
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState('medium')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [taskDay, setTaskDay] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [deleteDayKey, setDeleteDayKey] = useState(null)

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const display = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      slots.push({ value: time, display })
    }
    return slots
  }

  const addTask = () => {
    if (newTask.trim() && taskDay) {
      setTasks([...tasks, { 
        id: Date.now() + Math.random(), 
        text: newTask.trim(), 
        priority, 
        assignedDate: taskDay,
        completed: false 
      }])
      setNewTask('')
      setPriority('medium')
      setTaskDay('')
      setShowModal(false)
    }
  }

  const toggleTask = (id, dayKey) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const completions = task.completions || {}
        return {
          ...task,
          completions: {
            ...completions,
            [dayKey]: !completions[dayKey]
          }
        }
      }
      return task
    }))
  }

  const handleDeleteClick = (id, dayKey) => {
    setTaskToDelete(id)
    setDeleteDayKey(dayKey)
    setShowDeleteModal(true)
  }

  const deleteTaskForDay = () => {
    setTasks(tasks.map(task => {
      if (task.id === taskToDelete) {
        const hiddenDays = task.hiddenDays || []
        return {
          ...task,
          hiddenDays: [...hiddenDays, deleteDayKey]
        }
      }
      return task
    }))
    setShowDeleteModal(false)
    setTaskToDelete(null)
    setDeleteDayKey(null)
  }

  const deleteTaskCompletely = () => {
    setTasks(tasks.filter(task => task.id !== taskToDelete))
    setShowDeleteModal(false)
    setTaskToDelete(null)
    setDeleteDayKey(null)
  }

  const getWeekTasks = () => {
    const weekTasks = {}
    
    // Get Monday of the selected week
    const monday = new Date(selectedDate)
    const dayOfWeek = selectedDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    monday.setDate(selectedDate.getDate() + mondayOffset)
    
    // Generate tasks for each day of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      const dayKey = date.toDateString()
      const dayOfWeek = date.getDay()
      const dayOfMonth = date.getDate()
      
      weekTasks[dayKey] = tasks.filter(task => {
        // Check if task is hidden for this day
        if (task.hiddenDays && task.hiddenDays.includes(dayKey)) {
          return false
        }
        
        // If task has assigned date, only show on that date
        if (task.assignedDate) {
          return task.assignedDate === dayKey
        }
        
        // Show all tasks without type filtering
        return true
      })
    }
    
    return weekTasks
  }



  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setSelectedDate(newDate)
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tasks</h2>
        

        
        <p className="text-gray-600 dark:text-gray-400">Manage your daily tasks</p>
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigateWeek(-1)}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          ← Previous Week
        </button>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />Add Task
          </Button>
          <Button 
            onClick={() => setTasks([])} 
            variant="outline" 
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            Clear All
          </Button>
        </div>
        
        <button 
          onClick={() => navigateWeek(1)}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Next Week →
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-semibold">Priority</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const date = new Date(selectedDate)
                  const dayOfWeek = selectedDate.getDay()
                  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                  date.setDate(selectedDate.getDate() + mondayOffset + index)
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  return (
                    <th key={day} className={`p-3 text-center font-semibold ${
                      isToday ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : ''
                    }`}>
                      <div>{day}</div>
                      <div className="text-sm font-normal">{date.getDate()}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {['high', 'medium', 'low'].map(priority => {
                const weekTasks = getWeekTasks()
                
                return (
                  <tr key={priority} className="border-b">
                    <td className={`p-3 font-semibold capitalize ${
                      priority === 'high' ? 'text-red-600' :
                      priority === 'medium' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {priority}
                    </td>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      const date = new Date(selectedDate)
                      const dayOfWeek = selectedDate.getDay()
                      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                      date.setDate(selectedDate.getDate() + mondayOffset + index)
                      const dayKey = date.toDateString()
                      const dayTasks = weekTasks[dayKey] || []
                      const priorityTasks = dayTasks.filter(task => task.priority === priority)
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <td key={day} className={`p-2 align-top ${
                          isToday ? 'bg-green-50 dark:bg-green-900/20' : ''
                        }`}>
                          <div className="space-y-1">
                            {priorityTasks.map(task => (
                              <div key={task.id} className={`p-2 border rounded text-xs ${
                                task.completions?.[dayKey] ? 'opacity-60 bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
                              }`}>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => toggleTask(task.id, dayKey)}
                                    className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                      task.completions?.[dayKey] 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : 'border-gray-300 hover:border-green-500'
                                    }`}
                                  >
                                    {task.completions?.[dayKey] && <Check className="w-2 h-2" />}
                                  </button>
                                  <span className={`flex-1 ${task.completions?.[dayKey] ? 'line-through text-gray-500' : ''}`}>
                                    {task.text}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteClick(task.id, dayKey)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-2 h-2" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Description</label>
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task description..."
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Select Day *</label>
            <div className="grid grid-cols-7 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const date = new Date(selectedDate)
                const dayOfWeek = selectedDate.getDay()
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                date.setDate(selectedDate.getDate() + mondayOffset + index)
                const dayKey = date.toDateString()
                const isSelected = taskDay === dayKey
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setTaskDay(dayKey)}
                    className={`p-3 text-center rounded-xl border-2 transition-all transform hover:scale-105 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                        : isToday
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">{day}</div>
                    <div className="text-lg font-semibold">{date.getDate()}</div>
                    {isToday && !isSelected && <div className="text-xs mt-1 font-medium">Today</div>}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', icon: '🟢', label: 'Low', color: 'border-gray-300 bg-gray-50 text-gray-700' },
                { value: 'medium', icon: '🟡', label: 'Medium', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
                { value: 'high', icon: '🔴', label: 'High', color: 'border-red-300 bg-red-50 text-red-700' }
              ].map(({ value, icon, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    priority === value
                      ? `${color} border-opacity-100 bg-opacity-100`
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg mb-1">{icon}</div>
                  <div className="text-xs font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>


          <div className="flex gap-2 pt-4">
            <Button onClick={addTask} className="flex-1">
              Add Task
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Task">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Do you want to delete this task for just this day or completely remove it?
          </p>
          <div className="flex gap-2">
            <Button onClick={deleteTaskForDay} variant="outline" className="flex-1">
              This Day Only
            </Button>
            <Button onClick={deleteTaskCompletely} className="flex-1 bg-red-500 hover:bg-red-600">
              All Days
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}