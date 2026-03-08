import { useState, useEffect } from 'react'
import { Plus, X, ChevronDown, ChevronUp, Info, Zap } from 'lucide-react'
import PhaseProgressCard from './PhaseProgressCard'
import TemptationBundling from './TemptationBundling'
import HabitStatementPreview from './HabitStatementPreview'

export default function QuickHabitForm({ habits, onSubmit, onClose, editingHabit = null, scorecardHabit = null }) {
  const existingHabits = [...new Set(habits.map(h => h.newHabit).filter(Boolean))]
  const identities = [...new Set(habits.filter(h => h.identity).map(h => h.identity))]

  const getInitialForm = () => {
    if (editingHabit) {
      return {
        identity: editingHabit.identity || '',
        currentHabit: editingHabit.currentHabit || '',
        newHabit: editingHabit.newHabit || '',
        twoMinVersion: editingHabit.twoMinVersion || '',
        time: editingHabit.time || '',
        location: editingHabit.location || '',
        startDate: editingHabit.createdAt ? new Date(editingHabit.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        schedule: editingHabit.schedule || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }
    }
    if (scorecardHabit) {
      return {
        identity: scorecardHabit.identity || '',
        currentHabit: scorecardHabit.currentHabit || '',
        newHabit: scorecardHabit.newHabit || '',
        twoMinVersion: '',
        time: scorecardHabit.time || '',
        location: scorecardHabit.location || '',
        startDate: new Date().toISOString().split('T')[0],
        schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }
    }
    return {
      identity: '',
      currentHabit: '',
      newHabit: '',
      twoMinVersion: '',
      time: '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  }

  const [form, setForm] = useState(getInitialForm())
  const [customCurrent, setCustomCurrent] = useState(editingHabit ? (editingHabit.currentHabit && !existingHabits.includes(editingHabit.currentHabit)) : false)
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [difficulty, setDifficulty] = useState(editingHabit?.difficulty || null)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [step, setStep] = useState(1)

  const getTwoMinSuggestions = (habit) => {
    const h = habit.toLowerCase()
    if (h.includes('meditate') || h.includes('meditation')) return ['take 3 deep breaths', 'sit quietly for 1 minute', 'close eyes for 30 seconds']
    if (h.includes('exercise') || h.includes('workout') || h.includes('gym')) return ['do 1 pushup', 'do 5 jumping jacks', 'stretch for 1 minute']
    if (h.includes('read')) return ['read 1 page', 'read 1 paragraph', 'open the book']
    if (h.includes('journal') || h.includes('write')) return ['write 1 sentence', 'write 3 words', 'open journal']
    if (h.includes('run') || h.includes('jog')) return ['put on running shoes', 'walk for 2 minutes', 'do 1 lap']
    if (h.includes('yoga')) return ['do 1 pose', 'stretch for 1 minute', 'roll out mat']
    if (h.includes('study') || h.includes('learn')) return ['read 1 paragraph', 'review 1 flashcard', 'open textbook']
    if (h.includes('clean')) return ['clean 1 item', 'wipe 1 surface', 'pick up 1 thing']
    return []
  }

  const suggestions = form.newHabit ? getTwoMinSuggestions(form.newHabit) : []

  const getTimeSuggestions = () => {
    if (!form.time) return []
    const [hours, minutes] = form.time.split(':').map(Number)
    const timeInMinutes = hours * 60 + minutes
    return habits.filter(h => {
      if (!h.time) return false
      const [hHours, hMinutes] = h.time.split(':').map(Number)
      const hTimeInMinutes = hHours * 60 + hMinutes
      return Math.abs(timeInMinutes - hTimeInMinutes) <= 60
    }).slice(0, 3)
  }

  const getLocationSuggestions = () => {
    if (!form.location) return []
    return habits.filter(h => 
      h.location && h.location.toLowerCase().includes(form.location.toLowerCase())
    ).slice(0, 3)
  }

  const getIdentitySuggestions = () => {
    if (!form.identity) return []
    return habits.filter(h => 
      h.identity && h.identity.toLowerCase() === form.identity.toLowerCase()
    ).slice(0, 3)
  }

  const timeSuggestions = getTimeSuggestions()
  const locationSuggestions = getLocationSuggestions()
  const identitySuggestions = getIdentitySuggestions()

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
    
    if (difficulty === 'hard' && !form.twoMinVersion) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 5000)
      return
    }
    
    if (!form.twoMinVersion && difficulty !== 'hard') {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 5000)
    }
    
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
      difficulty,
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
      difficulty,
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

  const handleNext = () => {
    if (step === 1 && form.identity && form.newHabit && difficulty) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleSkip = async () => {
    if (!form.identity || !form.newHabit || !difficulty) return
    const e = { preventDefault: () => {} }
    await handleSubmit(e)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {step === 1 ? 'Create Your Habit' : step === 2 ? 'When & Where?' : 'Fine-tune Your Habit'}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              {[1, 2, 3].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => s < step || (s === 1 || (s === 2 && form.identity && form.newHabit && difficulty)) ? setStep(s) : null}
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${
                    s === step
                      ? 'bg-indigo-600 text-white scale-110'
                      : s < step
                      ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 cursor-pointer hover:scale-105'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 pb-safe">
          {/* STEP 1: Essential */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">I am a</label>
                <input
                  list="identities"
                  value={form.identity}
                  onChange={(e) => setForm(prev => ({ ...prev, identity: e.target.value }))}
                  placeholder="e.g., healthy person, reader"
                  className="w-full min-h-[48px] px-4 py-3.5 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <datalist id="identities">
                  {identities.map(id => <option key={id} value={id} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">I will</label>
                <input
                  type="text"
                  value={form.newHabit}
                  onChange={(e) => setForm(prev => ({ ...prev, newHabit: e.target.value }))}
                  placeholder="e.g., drink water"
                  className="w-full min-h-[48px] px-4 py-3.5 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">How challenging is this habit?</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDifficulty('easy')
                      setForm(prev => ({ ...prev, schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }))
                    }}
                    className={`min-h-[80px] p-4 rounded-xl border-2 transition-all active:scale-95 ${
                      difficulty === 'easy'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 shadow-md'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-green-400'
                    }`}
                  >
                    <div className="text-3xl mb-1">😊</div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Easy</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">I can do this daily</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDifficulty('medium')
                      setForm(prev => ({ ...prev, schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }))
                    }}
                    className={`min-h-[80px] p-4 rounded-xl border-2 transition-all active:scale-95 ${
                      difficulty === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 shadow-md'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-yellow-400'
                    }`}
                  >
                    <div className="text-3xl mb-1">😐</div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Medium</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Needs some effort</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDifficulty('hard')
                      setForm(prev => ({ ...prev, schedule: ['Mon', 'Wed', 'Fri'] }))
                    }}
                    className={`min-h-[80px] p-4 rounded-xl border-2 transition-all active:scale-95 ${
                      difficulty === 'hard'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 shadow-md'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-red-400'
                    }`}
                  >
                    <div className="text-3xl mb-1">😰</div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Hard</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">This will be tough</div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={!form.identity || !form.newHabit || !difficulty}
                  className="flex-1 min-h-[52px] px-4 py-3 text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors disabled:opacity-30"
                >
                  Add details later
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!form.identity || !form.newHabit || !difficulty}
                  className="flex-1 min-h-[52px] px-4 py-3 text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Context */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">At (time)</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full min-h-[48px] px-4 py-3.5 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">In (location)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., kitchen"
                  className="w-full min-h-[48px] px-4 py-3.5 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stack After</label>
                <select
                  value={form.currentHabit}
                  onChange={(e) => setForm(prev => ({ ...prev, currentHabit: e.target.value }))}
                  className="w-full min-h-[48px] px-4 py-3.5 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select habit</option>
                  {existingHabits.map(h => <option key={h} value={h}>{h}</option>)}
                </select>

                {!customCurrent && (timeSuggestions.length > 0 || locationSuggestions.length > 0 || identitySuggestions.length > 0) && (
                  <div className="mt-4 space-y-3">
                    {timeSuggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Stack after these {form.time} habits:</p>
                        <div className="space-y-2">
                          {timeSuggestions.map(h => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, currentHabit: h.newHabit }))}
                              className="w-full p-3 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all text-left"
                            >
                              <div className="font-semibold text-sm text-gray-900 dark:text-white">{h.newHabit}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{h.time}{h.location && ` • ${h.location}`}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {locationSuggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Other {form.location} habits:</p>
                        <div className="space-y-2">
                          {locationSuggestions.map(h => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, currentHabit: h.newHabit }))}
                              className="w-full p-3 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-500 transition-all text-left"
                            >
                              <div className="font-semibold text-sm text-gray-900 dark:text-white">{h.newHabit}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{h.time}{h.location && ` • ${h.location}`}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {identitySuggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{form.identity} habits:</p>
                        <div className="space-y-2">
                          {identitySuggestions.map(h => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, currentHabit: h.newHabit }))}
                              className="w-full p-3 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all text-left"
                            >
                              <div className="font-semibold text-sm text-gray-900 dark:text-white">{h.newHabit}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{h.time}{h.location && ` • ${h.location}`}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {form.currentHabit && form.newHabit && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg">
                  <p className="text-xs font-bold mb-2 opacity-80">HABIT STACK PREVIEW</p>
                  <p className="text-base sm:text-lg font-bold leading-relaxed">
                    After I <span className="underline decoration-2">{form.currentHabit}</span>, I will <span className="underline decoration-2">{form.newHabit}</span>
                    {form.time && ` at ${form.time}`}
                    {form.location && ` in ${form.location}`}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 min-h-[52px] px-4 py-3 text-base bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 min-h-[52px] px-4 py-3 text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Advanced */}
          {step === 3 && (
            <>
              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  2-Minute Version
                </label>
                <input
                  type="text"
                  value={form.twoMinVersion}
                  onChange={(e) => setForm(prev => ({ ...prev, twoMinVersion: e.target.value }))}
                  placeholder="e.g., do 1 pushup, read 1 page"
                  className="w-full min-h-[48px] px-4 py-3.5 text-[16px] bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {suggestions.length > 0 && !form.twoMinVersion && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, twoMinVersion: suggestion }))}
                        className="px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors border border-amber-300 dark:border-amber-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Repeat on</label>
                <div className="grid grid-cols-7 gap-2">
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
                      className={`min-h-[48px] px-2 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Starting From</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full min-h-[48px] px-4 py-3.5 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <PhaseProgressCard
                habit={form}
                onUpdate={(updated) => setForm(updated)}
              />

              <TemptationBundling
                habit={form}
                onUpdate={(updated) => setForm(updated)}
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 min-h-[52px] px-4 py-3 text-base bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 min-h-[52px] px-4 py-3 text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {loading ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
