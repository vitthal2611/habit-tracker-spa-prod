import { X, Briefcase, Home, ShoppingCart } from 'lucide-react'

const TEMPLATES = {
  work: {
    name: 'Work Project',
    icon: Briefcase,
    tasks: [
      { text: 'Review project requirements', priority: 'high', category: 'work' },
      { text: 'Create project plan', priority: 'high', category: 'work' },
      { text: 'Schedule team meeting', priority: 'medium', category: 'work' }
    ]
  },
  home: {
    name: 'Home Maintenance',
    icon: Home,
    tasks: [
      { text: 'Clean kitchen', priority: 'medium', category: 'personal' },
      { text: 'Do laundry', priority: 'low', category: 'personal' },
      { text: 'Organize closet', priority: 'low', category: 'personal' }
    ]
  },
  shopping: {
    name: 'Shopping List',
    icon: ShoppingCart,
    tasks: [
      { text: 'Buy groceries', priority: 'high', category: 'personal' },
      { text: 'Get household supplies', priority: 'medium', category: 'personal' },
      { text: 'Pick up prescriptions', priority: 'high', category: 'health' }
    ]
  }
}

export default function TaskTemplates({ onApply, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Task Templates</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(TEMPLATES).map(([key, template]) => {
            const Icon = template.icon
            return (
              <div key={key} className="border border-slate-200 dark:border-gray-700 rounded-xl p-4 hover:border-indigo-500 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{template.name}</h3>
                </div>
                <ul className="space-y-2 mb-4">
                  {template.tasks.map((t, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400">• {t.text}</li>
                  ))}
                </ul>
                <button onClick={() => onApply(template.tasks)} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
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
