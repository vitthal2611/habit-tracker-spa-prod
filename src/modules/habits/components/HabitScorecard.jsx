import { useState } from 'react'
import { Plus, Trash2, TrendingUp, ArrowRight } from 'lucide-react'

export default function HabitScorecard({ habits, onSave, onCreateHabit }) {
  const [scorecard, setScorecard] = useState(habits || [])
  const [newHabit, setNewHabit] = useState('')
  const [selectedBadHabit, setSelectedBadHabit] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const getReplacements = (badHabitText) => {
    const text = badHabitText.toLowerCase()
    if (text.includes('phone') || text.includes('social media')) return ['do 1 pushup', 'drink water', 'take 3 deep breaths']
    if (text.includes('junk') || text.includes('snack') || text.includes('candy')) return ['eat one piece of fruit', 'drink water', 'chew gum']
    if (text.includes('tv') || text.includes('netflix') || text.includes('watch')) return ['read 1 page', 'stretch for 1 minute', 'go for a walk']
    if (text.includes('smoke') || text.includes('cigarette')) return ['do 10 jumping jacks', 'drink water', 'chew gum']
    if (text.includes('procrastinate') || text.includes('delay')) return ['work for 2 minutes', 'write 1 task', 'clear desk']
    return ['do 1 pushup', 'drink water', 'take 3 deep breaths']
  }

  const getOppositeIdentity = (badHabitText) => {
    const text = badHabitText.toLowerCase()
    if (text.includes('phone') || text.includes('social')) return 'focused person'
    if (text.includes('junk') || text.includes('snack')) return 'healthy person'
    if (text.includes('tv') || text.includes('watch')) return 'productive person'
    if (text.includes('smoke')) return 'healthy person'
    if (text.includes('procrastinate')) return 'action-taker'
    return 'better person'
  }

  const handleImprove = (habit) => {
    setSelectedBadHabit(habit)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion) => {
    const habitData = {
      currentHabit: selectedBadHabit.text,
      newHabit: suggestion,
      identity: getOppositeIdentity(selectedBadHabit.text),
      time: '',
      location: ''
    }
    setShowSuggestions(false)
    setSelectedBadHabit(null)
    onCreateHabit(habitData)
  }

  const handleCustomReplacement = () => {
    const habitData = {
      currentHabit: selectedBadHabit.text,
      newHabit: '',
      identity: getOppositeIdentity(selectedBadHabit.text),
      time: '',
      location: ''
    }
    setShowSuggestions(false)
    setSelectedBadHabit(null)
    onCreateHabit(habitData)
  }

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
                        onClick={() => handleImprove(habit)}
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

      {/* Replacement Suggestions Modal */}
      {showSuggestions && selectedBadHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Let's replace this habit with a better one</h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">{selectedBadHabit.text}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-green-600 dark:text-green-400 font-semibold">Better habit</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose a replacement:</p>
              <div className="space-y-3">
                {getReplacements(selectedBadHabit.text).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl hover:border-green-400 dark:hover:border-green-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{suggestion}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">After I {selectedBadHabit.text}, I will {suggestion}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleCustomReplacement}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-gray-700 dark:text-gray-300 font-semibold"
              >
                + Create custom replacement
              </button>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowSuggestions(false); setSelectedBadHabit(null); }}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
