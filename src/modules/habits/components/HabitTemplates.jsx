import { X, Coffee, Dumbbell, BookOpen } from 'lucide-react'

const TEMPLATES = {
  morning: {
    name: 'Morning Routine',
    icon: Coffee,
    habits: [
      { identity: 'early riser', newHabit: 'wake up at 6 AM', time: '06:00', location: 'bedroom' },
      { identity: 'healthy person', newHabit: 'drink water', location: 'kitchen' },
      { identity: 'mindful person', newHabit: 'meditate for 5 minutes', twoMinVersion: 'take 3 deep breaths', location: 'living room' }
    ]
  },
  fitness: {
    name: 'Fitness',
    icon: Dumbbell,
    habits: [
      { identity: 'athlete', newHabit: 'do 10 pushups', twoMinVersion: 'do 1 pushup', location: 'home gym' },
      { identity: 'runner', newHabit: 'run for 20 minutes', twoMinVersion: 'put on running shoes', location: 'park' },
      { identity: 'healthy person', newHabit: 'stretch for 5 minutes', twoMinVersion: 'stretch arms', location: 'living room' }
    ]
  },
  learning: {
    name: 'Learning',
    icon: BookOpen,
    habits: [
      { identity: 'reader', newHabit: 'read for 20 minutes', twoMinVersion: 'read 1 page', location: 'study' },
      { identity: 'learner', newHabit: 'practice coding', twoMinVersion: 'open code editor', location: 'desk' },
      { identity: 'student', newHabit: 'review notes', twoMinVersion: 'open notebook', location: 'study' }
    ]
  }
}

export default function HabitTemplates({ onApply, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Templates</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(TEMPLATES).map(([key, template]) => {
            const Icon = template.icon
            return (
              <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-indigo-500 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{template.name}</h3>
                </div>
                <ul className="space-y-2 mb-4">
                  {template.habits.map((h, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {h.newHabit}</li>
                  ))}
                </ul>
                <button onClick={() => onApply(template.habits)} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                  Apply Template
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
