import { Target, CheckSquare, DollarSign, Plus } from 'lucide-react'

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  illustration 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
          {Icon && <Icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />}
        </div>
      )}
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function EmptyHabits({ onAdd }) {
  return (
    <EmptyState
      icon={Target}
      title="Start Your First Habit!"
      description="Build better habits one day at a time. Create your first habit to begin your journey."
      actionLabel="Add Habit"
      onAction={onAdd}
    />
  )
}

export function EmptyTodos({ onAdd }) {
  return (
    <EmptyState
      icon={CheckSquare}
      title="No Tasks Yet"
      description="Stay organized and productive. Add your first task to get started."
      actionLabel="Add Task"
      onAction={onAdd}
    />
  )
}

export function EmptyTransactions({ onAdd }) {
  return (
    <EmptyState
      icon={DollarSign}
      title="Set Up Your Budget"
      description="Take control of your finances. Start tracking your income and expenses today."
      actionLabel="Get Started"
      onAction={onAdd}
    />
  )
}
