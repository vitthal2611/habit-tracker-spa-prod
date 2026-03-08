import { useContext, useState } from 'react'
import { AppContext } from '../../contexts/AppContext'
import { TrendingUp, CheckCircle2, ListTodo, DollarSign, Calendar } from 'lucide-react'

export default function StatsModule() {
  const { state } = useContext(AppContext)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 500)
  }

  // Today's stats
  const today = new Date().toISOString().split('T')[0]
  const todayHabits = state.habits.filter(h => h.completions?.[today])
  const todayTodos = state.todos.filter(t => t.completed && t.completedAt?.startsWith(today))
  const todayExpenses = state.transactions.filter(t => t.date === today && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // This month habits
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()
  
  let monthCompletions = 0
  let monthPossible = 0
  state.habits.forEach(habit => {
    for (let d = 1; d <= currentDay; d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d).toISOString().split('T')[0]
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()]
      if (habit.schedule?.includes(dayName)) {
        monthPossible++
        if (habit.completions?.[date]) monthCompletions++
      }
    }
  })
  const monthRate = monthPossible > 0 ? Math.round((monthCompletions / monthPossible) * 100) : 0

  // Tasks by quadrant
  const quadrants = {
    urgent: state.todos.filter(t => t.quadrant === 'urgent-important' && t.completed).length,
    notUrgent: state.todos.filter(t => t.quadrant === 'not-urgent-important' && t.completed).length,
    delegate: state.todos.filter(t => t.quadrant === 'urgent-not-important' && t.completed).length,
    eliminate: state.todos.filter(t => t.quadrant === 'not-urgent-not-important' && t.completed).length
  }
  const totalTasks = Object.values(quadrants).reduce((a, b) => a + b, 0)

  // Budget vs actual
  const monthExpenses = state.transactions
    .filter(t => t.type === 'expense' && t.date >= monthStart)
    .reduce((sum, t) => sum + t.amount, 0)
  const totalBudget = Object.values(state.budgets).reduce((sum, b) => sum + (b || 0), 0)
  const budgetUsed = totalBudget > 0 ? Math.round((monthExpenses / totalBudget) * 100) : 0

  // 7-day trends
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  
  const habitTrend = last7Days.map(date => {
    const completed = state.habits.filter(h => h.completions?.[date]).length
    return completed
  })

  const maxHabit = Math.max(...habitTrend, 1)

  return (
    <div className="pb-safe">
      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-50 animate-bounce">
          Refreshing...
        </div>
      )}

      <div className="space-y-4">
        {/* Hero Card - Today's Overview */}
        <div 
          className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white min-h-[80px] active:scale-[0.98] transition-transform cursor-pointer"
          onClick={() => navigator.vibrate?.(10)}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-bold">Today's Overview</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{todayHabits.length}</p>
              <p className="text-sm opacity-90">Habits</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{todayTodos.length}</p>
              <p className="text-sm opacity-90">Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${todayExpenses.toFixed(0)}</p>
              <p className="text-sm opacity-90">Spent</p>
            </div>
          </div>
        </div>

        {/* Habits Card */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm min-h-[80px] active:scale-[0.98] transition-transform cursor-pointer"
          onClick={() => navigator.vibrate?.(10)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">Habits This Month</h3>
            </div>
            <span className="text-2xl font-bold text-green-600">{monthRate}%</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${monthRate}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {monthCompletions} of {monthPossible} completed
          </p>
        </div>

        {/* Tasks Card */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm min-h-[80px] active:scale-[0.98] transition-transform cursor-pointer"
          onClick={() => navigator.vibrate?.(10)}
        >
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Tasks Completed</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Urgent & Important</span>
              <span className="font-semibold text-red-600">{quadrants.urgent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Not Urgent & Important</span>
              <span className="font-semibold text-green-600">{quadrants.notUrgent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Urgent & Not Important</span>
              <span className="font-semibold text-yellow-600">{quadrants.delegate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Not Urgent & Not Important</span>
              <span className="font-semibold text-gray-600">{quadrants.eliminate}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: <span className="font-bold text-gray-900 dark:text-white">{totalTasks}</span> tasks completed
            </p>
          </div>
        </div>

        {/* Expenses Card */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm min-h-[80px] active:scale-[0.98] transition-transform cursor-pointer"
          onClick={() => navigator.vibrate?.(10)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">Budget This Month</h3>
            </div>
            <span className={`text-2xl font-bold ${budgetUsed > 100 ? 'text-red-600' : 'text-orange-600'}`}>
              {budgetUsed}%
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                budgetUsed > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            ${monthExpenses.toFixed(2)} of ${totalBudget.toFixed(2)}
          </p>
        </div>

        {/* Trends Card */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm min-h-[80px] active:scale-[0.98] transition-transform cursor-pointer"
          onClick={() => navigator.vibrate?.(10)}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">7-Day Habit Trend</h3>
          </div>
          <div className="flex items-end justify-between gap-1 h-24">
            {habitTrend.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t transition-all duration-300"
                  style={{ height: `${(count / maxHabit) * 100}%`, minHeight: count > 0 ? '8px' : '0' }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(last7Days[i]).getDay()]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
