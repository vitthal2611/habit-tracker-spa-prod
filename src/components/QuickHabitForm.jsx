import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

export default function QuickHabitForm({ habits, onSubmit, onClose }) {
  const [form, setForm] = useState({
    identity: '',
    currentHabit: '',
    newHabit: '',
    time: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0]
  })
  const [customCurrent, setCustomCurrent] = useState(false)
  const [loading, setLoading] = useState(false)

  const existingHabits = [...new Set(habits.map(h => h.newHabit).filter(Boolean))]
  const identities = [...new Set(habits.map(h => h.identity).filter(Boolean))]

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.newHabit || !form.identity) return
    
    setLoading(true)

    const stackAfterHabit = habits.find(h => h.newHabit === form.currentHabit)

    const habitData = {
      identity: form.identity,
      currentHabit: form.currentHabit || 'wake up',
      newHabit: form.newHabit,
      time: form.time,
      location: form.location,
      stackAfter: stackAfterHabit?.id,
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streak: 0,
      completions: {},
      createdAt: new Date(form.startDate).toISOString()
    }

    await onSubmit(habitData)
    setForm({ identity: '', currentHabit: '', newHabit: '', time: '', location: '', startDate: new Date().toISOString().split('T')[0] })
    setCustomCurrent(false)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Add Habit</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a</label>
            <input
              list="identities"
              value={form.identity}
              onChange={(e) => setForm(prev => ({ ...prev, identity: e.target.value }))}
              placeholder="e.g., healthy person, reader"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <datalist id="identities">
              {identities.map(id => <option key={id} value={id} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Starting From</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">After I {existingHabits.length === 0 && '(optional)'}</label>
              {customCurrent ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.currentHabit}
                    onChange={(e) => setForm(prev => ({ ...prev, currentHabit: e.target.value }))}
                    placeholder="e.g., wake up"
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => { setCustomCurrent(false); setForm(prev => ({ ...prev, currentHabit: '' })); }}
                    className="px-3 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={form.currentHabit}
                    onChange={(e) => setForm(prev => ({ ...prev, currentHabit: e.target.value }))}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select habit</option>
                    {existingHabits.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCustomCurrent(true)}
                    className="px-3 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    title="Add custom habit"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I will</label>
              <input
                type="text"
                value={form.newHabit}
                onChange={(e) => setForm(prev => ({ ...prev, newHabit: e.target.value }))}
                placeholder="e.g., drink water"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">At (time)</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">In (location)</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., kitchen"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {form.currentHabit && form.newHabit && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-xs font-semibold mb-1 opacity-80">HABIT STATEMENT</p>
              <p className="text-base font-bold">
                After I {form.currentHabit}, I will {form.newHabit}
                {form.time && ` at ${form.time}`}
                {form.location && ` in ${form.location}`}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
