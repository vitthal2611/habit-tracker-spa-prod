import { useState } from 'react'
import { X, Bell } from 'lucide-react'

export default function HabitReminders({ habit, onSave, onClose }) {
  const [reminders, setReminders] = useState(habit.reminders || [])
  const [newTime, setNewTime] = useState('')

  const addReminder = () => {
    if (newTime && !reminders.includes(newTime)) {
      setReminders([...reminders, newTime].sort())
      setNewTime('')
    }
  }

  const removeReminder = (time) => {
    setReminders(reminders.filter(t => t !== time))
  }

  const handleSave = () => {
    onSave({ ...habit, reminders })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set Reminders</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">For: {habit.newHabit || habit.habit}</p>
          <div className="flex gap-2">
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <button onClick={addReminder} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">Add</button>
          </div>
          <div className="space-y-2">
            {reminders.map(time => (
              <div key={time} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">{time}</span>
                </div>
                <button onClick={() => removeReminder(time)} className="text-red-500 hover:text-red-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">
            Save Reminders
          </button>
        </div>
      </div>
    </div>
  )
}
