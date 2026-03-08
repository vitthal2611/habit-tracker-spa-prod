import { useState } from 'react'
import { Plus, X, Target, TrendingUp } from 'lucide-react'

export default function FinancialGoals({ goals, onSave, transactions }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', deadline: '', category: 'Savings' })

  const addGoal = () => {
    if (form.name && form.target) {
      onSave([...goals, { ...form, id: Date.now(), current: 0 }])
      setForm({ name: '', target: '', deadline: '', category: 'Savings' })
      setShowForm(false)
    }
  }

  const deleteGoal = (id) => onSave(goals.filter(g => g.id !== id))

  const getProgress = (goal) => {
    const saved = transactions.filter(t => t.category === goal.category && t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    return Math.min((saved / goal.target) * 100, 100)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Financial Goals</h3>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" />Add Goal
        </button>
      </div>
      <div className="space-y-4">
        {goals.map(goal => {
          const progress = getProgress(goal)
          return (
            <div key={goal.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{goal.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target: ₹{goal.target}</p>
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="text-red-500 hover:text-red-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{progress.toFixed(0)}%</span>
                  {goal.deadline && <span className="text-gray-600 dark:text-gray-400">Due: {new Date(goal.deadline).toLocaleDateString()}</span>}
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Financial Goal</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Goal name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <input type="number" placeholder="Target amount" value={form.target} onChange={(e) => setForm({...form, target: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <input type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={addGoal} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
