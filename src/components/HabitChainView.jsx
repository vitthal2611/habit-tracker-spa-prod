import { Link2, ArrowRight } from 'lucide-react'

export default function HabitChainView({ habits, getHabitChain }) {
  const groupedByTime = habits.reduce((acc, habit) => {
    const group = habit.habitGroup || 'Other'
    if (!acc[group]) acc[group] = []
    acc[group].push(habit)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(groupedByTime).map(([group, groupHabits]) => (
        <div key={group} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{group} Chain</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {groupHabits.map((habit, index) => (
              <div key={habit.id} className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4 border-2 border-cyan-200 dark:border-cyan-800">
                  <div className="text-xs text-gray-400 mb-1">Node: {habit.id.slice(-4)}</div>
                  {habit.prevId && <div className="text-xs text-orange-500 mb-1">← Prev: {habit.prevId.slice(-4)}</div>}
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{habit.newHabit}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{habit.identity}</div>
                  {habit.nextId && <div className="text-xs text-blue-500 mt-1">Next: {habit.nextId.slice(-4)} →</div>}
                </div>
                {index < groupHabits.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
