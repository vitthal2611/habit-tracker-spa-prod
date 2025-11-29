import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

export default function QuickHabitForm({ habits, onSubmit, onClose, editingHabit = null }) {
  const existingHabits = [...new Set(habits.map(h => h.newHabit).filter(Boolean))]
  const identities = [...new Set(habits.filter(h => h.identity).map(h => h.identity))]

  const [form, setForm] = useState(editingHabit ? {
    identity: editingHabit.identity || '',
    currentHabit: editingHabit.currentHabit || '',
    newHabit: editingHabit.newHabit || '',
    twoMinVersion: editingHabit.twoMinVersion || '',
    time: editingHabit.time || '',
    location: editingHabit.location || '',
    startDate: editingHabit.createdAt ? new Date(editingHabit.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    schedule: editingHabit.schedule || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  } : {
    identity: '',
    currentHabit: '',
    newHabit: '',
    twoMinVersion: '',
    time: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  })
  const [customCurrent, setCustomCurrent] = useState(editingHabit ? (editingHabit.currentHabit && !existingHabits.includes(editingHabit.currentHabit)) : false)
  const [loading, setLoading] = useState(false)

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

    const habitData = editingHabit ? {
      ...editingHabit,
      identity: form.identity,
      currentHabit: form.currentHabit || 'wake up',
      newHabit: form.newHabit,
      twoMinVersion: form.twoMinVersion,
      time: form.time,
      location: form.location,
      stackAfter: stackAfterHabit?.id,
      schedule: form.schedule,
      createdAt: new Date(form.startDate).toISOString()
    } : {
      identity: form.identity,
      currentHabit: form.currentHabit || 'wake up',
      newHabit: form.newHabit,
      twoMinVersion: form.twoMinVersion,
      time: form.time,
      location: form.location,
      stackAfter: stackAfterHabit?.id,
      schedule: form.schedule,
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streak: 0,
      completions: {},
      createdAt: new Date(form.startDate).toISOString()
    }

    await onSubmit(habitData)
    setForm({ identity: '', currentHabit: '', newHabit: '', twoMinVersion: '', time: '', location: '', startDate: new Date().toISOString().split('T')[0], schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] })
    setCustomCurrent(false)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{editingHabit ? 'Edit Habit' : 'Quick Add Habit'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a</label>
            <input
              list="identities"
              value={form.identity}
              onChange={(e) => setForm(prev => ({ ...prev, identity: e.target.value }))}
              placeholder="e.g., healthy person, reader"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <datalist id="identities">
              {editingHabit && form.identity && !identities.includes(form.identity) && (
                <option value={form.identity} />
              )}
              {identities.map(id => <option key={id} value={id} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Starting From</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">After I {existingHabits.length === 0 && '(optional)'}</label>
              {customCurrent ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={form.currentHabit}
                    onChange={(e) => setForm(prev => ({ ...prev, currentHabit: e.target.value }))}
                    placeholder="e.g., wake up"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setCustomCurrent(false); setForm(prev => ({ ...prev, currentHabit: '' })); }}
                    className="w-full sm:w-auto px-3 py-2 sm:py-2.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back to List
                  </button>
                </div>
              ) : (
                <select
                  value={form.currentHabit}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomCurrent(true)
                      setForm(prev => ({ ...prev, currentHabit: '' }))
                    } else {
                      setForm(prev => ({ ...prev, currentHabit: e.target.value }))
                    }
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select habit</option>
                  {editingHabit && form.currentHabit && !existingHabits.includes(form.currentHabit) && (
                    <option value={form.currentHabit}>{form.currentHabit}</option>
                  )}
                  {existingHabits.map(h => <option key={h} value={h}>{h}</option>)}
                  <option value="__custom__">+ Add new habit</option>
                </select>
              )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I will</label>
            <input
              type="text"
              value={form.newHabit}
              onChange={(e) => setForm(prev => ({ ...prev, newHabit: e.target.value }))}
              placeholder="e.g., drink water"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2-Minute Version</label>
            <input
              type="text"
              value={form.twoMinVersion}
              onChange={(e) => setForm(prev => ({ ...prev, twoMinVersion: e.target.value }))}
              placeholder="e.g., drink one sip of water"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">At (time)</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">In (location)</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., kitchen"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repeat on</label>
            <div className="flex flex-wrap gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      schedule: prev.schedule.includes(day)
                        ? prev.schedule.filter(d => d !== day)
                        : [...prev.schedule, day]
                    }))
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    form.schedule.includes(day)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {form.currentHabit && form.newHabit && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3 sm:p-4 text-white">
              <p className="text-xs font-semibold mb-1 opacity-80">HABIT STATEMENT</p>
              <p className="text-sm sm:text-base font-bold">
                After I {form.currentHabit}, I will {form.newHabit}
                {form.time && ` at ${form.time}`}
                {form.location && ` in ${form.location}`}
              </p>
              {form.twoMinVersion && (
                <p className="text-xs sm:text-sm mt-2 opacity-90">
                  Start with: {form.twoMinVersion}
                </p>
              )}
              {form.schedule.length > 0 && form.schedule.length < 7 && (
                <p className="text-xs sm:text-sm mt-2 opacity-90">
                  On: {form.schedule.join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (editingHabit ? 'Updating...' : 'Adding...') : (editingHabit ? 'Update Habit' : 'Add Habit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
