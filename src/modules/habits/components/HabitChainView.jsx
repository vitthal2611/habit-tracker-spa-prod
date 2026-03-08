import { useState } from 'react'
import { ChevronRight, Plus, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

export default function HabitChainView({ habits, onToggle, onAdd }) {
  const [expandedChain, setExpandedChain] = useState(null)
  const today = new Date().toDateString()

  // Build chains from linked habits
  const chains = habits.reduce((acc, habit) => {
    if (!habit.prevId) {
      const chain = []
      let current = habit
      while (current) {
        chain.push(current)
        current = habits.find(h => h.id === current.nextId)
      }
      if (chain.length > 0) acc.push(chain)
    }
    return acc
  }, [])

  // Standalone habits (not in chains)
  const standalone = habits.filter(h => !h.prevId && !h.nextId)

  const getChainStats = (chain) => {
    const completed = chain.filter(h => h.completions[today]).length
    const total = chain.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const isBroken = chain.some((h, i) => i > 0 && !h.completions[today] && chain[i - 1].completions[today])
    return { completed, total, percentage, isBroken }
  }

  const HabitNode = ({ habit, isLast, chainIndex }) => {
    const isCompleted = habit.completions[today]
    const isExpanded = expandedChain === `${chainIndex}-${habit.id}`

    return (
      <div className="relative">
        <div 
          onClick={() => setExpandedChain(isExpanded ? null : `${chainIndex}-${habit.id}`)}
          className={`
            bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all cursor-pointer
            ${isCompleted 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle(habit.id)
              }}
              className="flex-shrink-0"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {habit.newHabit || habit.habit}
              </h3>
              {habit.habitStatement && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {habit.habitStatement}
                </p>
              )}
            </div>
            {habit.streak > 0 && (
              <div className="flex-shrink-0 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {habit.streak}🔥
                </span>
              </div>
            )}
          </div>
          
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {habit.identity && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Identity:</span> {habit.identity}
                </p>
              )}
              {habit.location && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Location:</span> {habit.location}
                </p>
              )}
            </div>
          )}
        </div>

        {!isLast && (
          <div className="flex justify-center my-2">
            <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {chains.map((chain, chainIndex) => {
        const stats = getChainStats(chain)
        return (
          <div 
            key={chainIndex}
            className={`
              bg-gradient-to-br rounded-2xl p-6 border-2
              ${stats.isBroken 
                ? 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700' 
                : stats.percentage === 100
                ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                : 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'
              }
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${stats.isBroken 
                    ? 'bg-red-100 dark:bg-red-900/30' 
                    : 'bg-indigo-100 dark:bg-indigo-900/30'
                  }
                `}>
                  {stats.isBroken ? (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Habit Chain {chainIndex + 1}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {chain.length} habits stacked
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                  {stats.percentage}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.completed}/{stats.total} done
                </div>
              </div>
            </div>

            {stats.isBroken && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  ⚠️ Chain broken! Complete habits in order to maintain the flow.
                </p>
              </div>
            )}

            <div className="space-y-0">
              {chain.map((habit, idx) => (
                <HabitNode 
                  key={habit.id} 
                  habit={habit} 
                  isLast={idx === chain.length - 1}
                  chainIndex={chainIndex}
                />
              ))}
            </div>

            <button
              onClick={() => onAdd(chain[chain.length - 1].id)}
              className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Chain
            </button>
          </div>
        )
      })}

      {standalone.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Standalone Habits
          </h3>
          <div className="space-y-3">
            {standalone.map(habit => (
              <div key={habit.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <button onClick={() => onToggle(habit.id)}>
                  {habit.completions[today] ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                  {habit.newHabit || habit.habit}
                </span>
                <button
                  onClick={() => onAdd(habit.id)}
                  className="px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  Start Chain
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {chains.length === 0 && standalone.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChevronRight className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Habit Chains Yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create habits and stack them to build powerful chains
          </p>
        </div>
      )}
    </div>
  )
}
