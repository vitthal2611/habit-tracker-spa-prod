import { Target, CheckSquare, DollarSign, Plus } from 'lucide-react'

const illustrations = {
  habits: {
    icon: Target,
    title: 'No Habits Yet',
    description: 'Start building better habits today',
    tip: 'Link new habits to existing ones for better success',
    emoji: '🎯'
  },
  todos: {
    icon: CheckSquare,
    title: 'No Tasks Yet',
    description: 'Add your first task to get started',
    tip: 'Organize tasks by categories and priorities',
    emoji: '✅'
  },
  expenses: {
    icon: DollarSign,
    title: 'No Expenses Yet',
    description: 'Track your spending to reach your goals',
    tip: 'Set budgets and monitor your financial health',
    emoji: '💰'
  }
}

export default function EmptyState({ type = 'habits', onAction, actionLabel = 'Get Started' }) {
  const config = illustrations[type]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mb-6 animate-bounce-in">
        <span className="text-5xl">{config.emoji}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{config.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-1 max-w-md">{config.description}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 max-w-md">{config.tip}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
