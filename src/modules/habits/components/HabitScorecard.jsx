import { useState } from 'react'
import { Plus, Trash2, TrendingUp } from 'lucide-react'

export default function HabitScorecard({ habits, onSave, onCreateHabit }) {
  const [scorecard, setScorecard] = useState(habits || [])
  const [newHabit, setNewHabit] = useState('')

  const addHabit = () => {
    if (newHabit.trim()) {
      setScorecard([...scorecard, {
        id: `habit_${Date.now()}`,
        text: newHabit.trim(),
        type: 'neutral',
        frequency: 'daily',
        awarenessScore: 5
      }])
      setNewHabit('')
    }
  }

  const updateHabit = (id, field, value) => {
    setScorecard(scorecard.map(h => h.id === id ? { ...h, [field]: value } : h))
  }

  const deleteHabit = (id) => {
    setScorecard(scorecard.filter(h => h.id !== id))
  }

  const getTypeColor = (type) => {
    switch(type) {
      case 'good': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'bad': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Habit Scorecard</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">List your current habits and mark them as good (+), bad (-), or neutral (=)</p>
      </div>

      {/* Add New Habit */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          placeholder="Add a habit (e.g., Check phone first thing)"
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button onClick={addHabit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Scorecard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Habit</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Frequency</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {scorecard.map(habit => (
              <tr key={habit.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={habit.text}
                    onChange={(e) => updateHabit(habit.id, 'text', e.target.value)}
                    className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => updateHabit(habit.id, 'type', 'good')}
                      className={`px-3 py-1 rounded font-semibold text-sm ${habit.type === 'good' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateHabit(habit.id, 'type', 'neutral')}
                      className={`px-3 py-1 rounded font-semibold text-sm ${habit.type === 'neutral' ? 'bg-gray-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                      =
                    </button>
                    <button
                      onClick={() => updateHabit(habit.id, 'type', 'bad')}
                      className={`px-3 py-1 rounded font-semibold text-sm ${habit.type === 'bad' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                      -
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <select
                    value={habit.frequency}
                    onChange={(e) => updateHabit(habit.id, 'frequency', e.target.value)}
                    className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="rarely">Rarely</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={habit.awarenessScore}
                    onChange={(e) => updateHabit(habit.id, 'awarenessScore', parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-center"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    {habit.type === 'bad' && (
                      <button
                        onClick={() => onCreateHabit(habit)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" /> Improve
                      </button>
                    )}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {scorecard.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No habits yet. Add your first habit above!</p>
        </div>
      )}

      <button
        onClick={() => onSave(scorecard)}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
      >
        Save Scorecard
      </button>
    </div>
  )
}
