import { useState } from 'react'
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react'

export default function SavingsGoalsManager({ goals = [], onSave, onDelete }) {
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: 0,
    current: 0,
    deadline: '',
    category: 'Emergency Fund'
  })

  const categories = ['Emergency Fund', 'Vacation', 'Home', 'Car', 'Education', 'Retirement', 'Other']

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return
    
    const goal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    onSave([...goals, goal])
    setNewGoal({ name: '', target: 0, current: 0, deadline: '', category: 'Emergency Fund' })
    setShowAddGoal(false)
  }

  const updateGoalProgress = (goalId, amount) => {
    const updated = goals.map(g => 
      g.id === goalId ? { ...g, current: g.current + amount } : g
    )
    onSave(updated)
  }

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6" />
            Savings Goals
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your financial goals</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const progress = (goal.current / goal.target) * 100
          const daysRemaining = getDaysRemaining(goal.deadline)
          
          return (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {goal.category}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(goal.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold">
                    ₹{goal.current.toLocaleString()} / ₹{goal.target.toLocaleString()}
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getProgressColor(progress)} transition-all`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {progress.toFixed(1)}% Complete
                  </span>
                  {daysRemaining !== null && (
                    <span className={`text-xs ${daysRemaining < 30 ? 'text-red-600' : 'text-gray-600'}`}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                    </span>
                  )}
                </div>

                {progress < 100 && (
                  <div className="flex gap-2 mt-4">
                    <input
                      type="number"
                      placeholder="Add amount"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          updateGoalProgress(goal.id, parseFloat(e.target.value))
                          e.target.value = ''
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousSibling
                        if (input.value) {
                          updateGoalProgress(goal.id, parseFloat(input.value))
                          input.value = ''
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                )}

                {progress >= 100 && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-lg text-center font-semibold">
                    🎉 Goal Achieved!
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Savings Goals Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Start tracking your financial goals today!</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Savings Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Emergency Fund"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Amount</label>
                <input
                  type="number"
                  value={newGoal.target || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Amount (Optional)</label>
                <input
                  type="number"
                  value={newGoal.current || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, current: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
