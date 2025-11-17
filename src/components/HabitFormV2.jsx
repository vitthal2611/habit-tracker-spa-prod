import { useState, useEffect } from 'react'
import { X, Sparkles, Target, Clock, MapPin, Zap, Gift, Calendar } from 'lucide-react'

export default function HabitFormV2({ isOpen, onClose, onSubmit, habits, editingHabit = null }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    identity: '', prefix: 'After', currentHabit: '', newHabit: '', location: '', time: '', 
    environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: [], specificDates: [], quadrant: '', habitGroup: ''
  })

  useEffect(() => {
    if (editingHabit) {
      setForm(editingHabit)
    } else {
      setForm({
        identity: '', prefix: 'After', currentHabit: '', newHabit: '', location: '', time: '', 
        environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: [], specificDates: [], quadrant: '', habitGroup: ''
      })
    }
  }, [editingHabit])

  const identities = [...new Set(habits.map(h => h.identity).filter(Boolean))]
  const locations = [...new Set(habits.map(h => h.location).filter(Boolean))]
  const currentHabits = [...new Set([
    ...habits.map(h => h.currentHabit).filter(Boolean),
    ...habits.map(h => h.newHabit).filter(Boolean)
  ])]
  
  const getHabitSentence = () => {
    if (!form.currentHabit || !form.newHabit) return ''
    return `${form.prefix} I ${form.currentHabit}${form.time ? ` at ${form.time}` : ''}${form.location ? ` in ${form.location}` : ''}, I will ${form.newHabit}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.newHabit.trim() || !form.identity || !form.currentHabit.trim() || !form.habitGroup) return
    
    const habitStatement = `After I ${form.currentHabit}, I will ${form.newHabit}`
    const stackAfterHabit = habits.find(h => h.newHabit === form.currentHabit || h.currentHabit === form.currentHabit)
    
    const habitData = editingHabit 
      ? { ...form, habitStatement }
      : { ...form, habitStatement, stackAfter: stackAfterHabit?.id, id: `habit_${Date.now()}`, completed: false, streak: 0, completions: {}, createdAt: new Date().toISOString() }
    
    onSubmit(habitData)
    setForm({ identity: '', prefix: 'After', currentHabit: '', newHabit: '', location: '', time: '', environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: [], specificDates: [], quadrant: '', habitGroup: '' })
    setStep(1)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 p-4 sm:p-6 text-white">
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{editingHabit ? 'Edit Habit' : 'New Habit'}</h2>
              <p className="text-xs sm:text-sm text-white/80">Step {step} of 4</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full bg-white transition-all duration-500 ${s <= step ? 'w-full' : 'w-0'}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-180px)]">
          
          {/* Step 1: Core Details */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">Identity</h3>
                    <p className="text-xs text-gray-500">Who do you want to become?</p>
                  </div>
                </div>
                <input
                  list="identities"
                  value={form.identity}
                  onChange={(e) => setForm(prev => ({ ...prev, identity: e.target.value }))}
                  placeholder="e.g., A fit person, A reader"
                  className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[48px]"
                  required
                />
                <datalist id="identities">
                  {identities.map(id => <option key={id} value={id} />)}
                </datalist>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">New Habit</h3>
                    <p className="text-xs text-gray-500">What will you do?</p>
                  </div>
                </div>
                <input
                  value={form.newHabit}
                  onChange={(e) => setForm(prev => ({ ...prev, newHabit: e.target.value }))}
                  placeholder="e.g., Drink warm water, Go to toilet, Brush teeth"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🕐</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Habit Group</h3>
                    <p className="text-xs text-gray-500">When do you do this?</p>
                  </div>
                </div>
                <select
                  value={form.habitGroup || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, habitGroup: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                >
                  <option value="">Select time of day</option>
                  <option value="Morning">🌅 Morning Habit</option>
                  <option value="Afternoon">☀️ Afternoon Habit</option>
                  <option value="Evening">🌆 Evening Habit</option>
                  <option value="Night">🌙 Night Habit</option>
                </select>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔗</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Stack After</h3>
                    <p className="text-xs text-gray-500">Which habit comes before this?</p>
                  </div>
                </div>
                <input
                  list="currentHabits"
                  value={form.currentHabit}
                  onChange={(e) => setForm(prev => ({ ...prev, currentHabit: e.target.value }))}
                  placeholder="e.g., Wake up, Drink water, Go to toilet"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
                <datalist id="currentHabits">
                  {currentHabits.map(h => <option key={h} value={h} />)}
                </datalist>
              </div>

              {form.currentHabit && form.newHabit && (
                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-xl">
                  <p className="text-xs font-semibold mb-2 opacity-90">🔗 YOUR HABIT STACK</p>
                  <p className="text-base sm:text-lg font-bold leading-relaxed">After I {form.currentHabit}, I will {form.newHabit}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Make it Obvious */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Make it Obvious</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Design your environment</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <label className="block font-semibold mb-3 text-gray-900 dark:text-gray-100">Environment Cue</label>
                <textarea
                  value={form.environmentTips}
                  onChange={(e) => setForm(prev => ({ ...prev, environmentTips: e.target.value }))}
                  placeholder="e.g., Put the book on my pillow, Place water bottle on desk"
                  rows="3"
                  className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">💡 How will you make this habit visible?</p>
              </div>
            </div>
          )}

          {/* Step 3: Make it Attractive & Easy */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Make it Attractive</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bundle with something you enjoy</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <label className="block font-semibold mb-3 text-gray-900 dark:text-gray-100">Temptation Bundling</label>
                <textarea
                  value={form.makeAttractive}
                  onChange={(e) => setForm(prev => ({ ...prev, makeAttractive: e.target.value }))}
                  placeholder="e.g., Listen to favorite music, Use fancy water bottle"
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                />
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Make it Easy</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reduce friction, start small</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <label className="block font-semibold mb-3 text-gray-900 dark:text-gray-100">2-Minute Version</label>
                <textarea
                  value={form.makeEasy}
                  onChange={(e) => setForm(prev => ({ ...prev, makeEasy: e.target.value }))}
                  placeholder="e.g., Just put on workout clothes, Just open the book"
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Make it Satisfying & Schedule */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-2xl p-6 border-2 border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Make it Satisfying</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reward yourself immediately</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <label className="block font-semibold mb-3 text-gray-900 dark:text-gray-100">Immediate Reward</label>
                <textarea
                  value={form.makeSatisfying}
                  onChange={(e) => setForm(prev => ({ ...prev, makeSatisfying: e.target.value }))}
                  placeholder="e.g., Check off calendar, Feel energized, Track progress"
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  <label className="font-semibold text-gray-900 dark:text-gray-100">Schedule</label>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }))} className="px-3 sm:px-4 py-2.5 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all min-h-[44px]">
                    Daily
                  </button>
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }))} className="px-3 sm:px-4 py-2.5 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all min-h-[44px]">
                    Weekdays
                  </button>
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, schedule: ['Sat', 'Sun'] }))} className="px-3 sm:px-4 py-2.5 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all min-h-[44px]">
                    Weekends
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const schedule = form.schedule || []
                        const newSchedule = schedule.includes(day) ? schedule.filter(d => d !== day) : [...schedule, day]
                        setForm(prev => ({ ...prev, schedule: newSchedule }))
                      }}
                      className={`py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[48px] ${
                        (form.schedule || []).includes(day)
                          ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 sm:gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 sm:px-6 py-3.5 text-sm sm:text-base bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all min-h-[52px]"
              >
                ← Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!form.newHabit.trim() || !form.identity || !form.currentHabit.trim() || !form.habitGroup)}
                className="flex-1 px-4 sm:px-6 py-3.5 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[52px]"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.newHabit.trim() || !form.identity || !form.currentHabit.trim() || !form.habitGroup}
                className="flex-1 px-4 sm:px-6 py-3.5 text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[52px]"
              >
                ✓ {editingHabit ? 'Update' : 'Create'} Habit
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
