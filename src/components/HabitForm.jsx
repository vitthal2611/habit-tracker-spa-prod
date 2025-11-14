import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import Dropdown from './ui/Dropdown'
import Modal from './ui/Modal'

export default function HabitForm({ isOpen, onClose, onSubmit, habits, editingHabit = null }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(editingHabit || {
    identity: '', prefix: 'After', currentHabit: '', newHabit: '', location: '', time: '', 
    environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: [], specificDates: [], quadrant: ''
  })
  const [showAddModal, setShowAddModal] = useState({ type: '', isOpen: false })
  const [newOption, setNewOption] = useState('')

  const identities = [...new Set(habits.map(h => h.identity).filter(Boolean))]
  const locations = [...new Set(habits.map(h => h.location).filter(Boolean))]
  const currentHabits = [...new Set(habits.map(h => h.currentHabit).filter(Boolean))]
  
  const prefixOptions = ['After', 'Before', 'When']
  
  const timeOptions = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00', '23:00', 'Anytime'
  ]
  
  const getHabitSentence = () => {
    if (!form.currentHabit || !form.newHabit) return ''
    return `${form.prefix} I ${form.currentHabit}${form.time ? ` at ${form.time}` : ''}${form.location ? ` in ${form.location}` : ''}, I will ${form.newHabit}`
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.newHabit.trim() || !form.time || !form.identity) return
    
    const habitStatement = getHabitSentence() || `${form.time ? `At ${form.time}` : ''}${form.location ? ` in the ${form.location}` : ''}, I will ${form.newHabit}`
    
    const habitData = editingHabit 
      ? { ...form, habitStatement }
      : { ...form, habitStatement, id: `habit_${Date.now()}`, completed: false, streak: 0, completions: {}, createdAt: new Date().toISOString() }
    
    onSubmit(habitData)
    setForm({ identity: '', prefix: 'After', currentHabit: '', newHabit: '', location: '', time: '', environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: [], specificDates: [], quadrant: '' })
    setStep(1)
    onClose()
  }
  
  const handleClose = () => {
    setStep(1)
    onClose()
  }

  const handleAddNew = (type, value) => {
    setForm(prev => ({ ...prev, [type]: value }))
    setNewOption('')
    setShowAddModal({ type: '', isOpen: false })
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={`${editingHabit ? 'Edit' : 'Create'} Habit - Step ${step} of 4`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${
                  s < step ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>}
              </div>
            ))}
          </div>
          
          {/* Step 1: Identity & Implementation Intention */}
          {step === 1 && (
            <div className="space-y-3">
              {/* Habit Preview */}
              {getHabitSentence() && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg text-white shadow-lg">
                  <div className="text-xs opacity-90 mb-1 flex items-center gap-1">
                    <span>💡</span>
                    <span>Your Habit Statement</span>
                  </div>
                  <div className="text-sm font-medium leading-relaxed">
                    {getHabitSentence()}
                  </div>
                </div>
              )}

              {/* Identity Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <span>What identity you want to build *</span>
                </h3>
                <Dropdown
                  options={identities}
                  value={form.identity}
                  onChange={(value) => setForm(prev => ({ ...prev, identity: value }))}
                  onAddNew={() => setShowAddModal({ type: 'identity', isOpen: true })}
                  placeholder="e.g., a fit person, a reader"
                  required
                />
              </div>

              {/* New Habit Section - Moved up for priority */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <span>What You'll Do *</span>
                </h3>
                <Input
                  value={form.newHabit}
                  onChange={(e) => setForm(prev => ({ ...prev, newHabit: e.target.value }))}
                  placeholder="e.g., Read a book, Drink water"
                  required
                />
              </div>

              {/* Implementation Intention Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span className="text-base">📍</span>
                  <span>When & Where *</span>
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Location</label>
                    <Dropdown
                      options={locations}
                      value={form.location}
                      onChange={(value) => setForm(prev => ({ ...prev, location: value }))}
                      onAddNew={() => setShowAddModal({ type: 'location', isOpen: true })}
                      placeholder="e.g., Bedroom, Kitchen"
                      required
                    />
                  </div>
                  
                  {/* Habit Stacking */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Stack After (Optional)</label>
                    <div className="space-y-2">
                      <Dropdown
                        options={prefixOptions}
                        value={form.prefix}
                        onChange={(value) => setForm(prev => ({ ...prev, prefix: value }))}
                        placeholder="Select prefix"
                      />
                      <Dropdown
                        options={currentHabits}
                        value={form.currentHabit}
                        onChange={(value) => setForm(prev => ({ ...prev, currentHabit: value }))}
                        onAddNew={() => setShowAddModal({ type: 'currentHabit', isOpen: true })}
                        placeholder="e.g., Wake up, Brush teeth"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment Cues */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span className="text-base">🔔</span>
                  <span>Make It Obvious (Optional)</span>
                </h3>
                <Input
                  value={form.environmentTips}
                  onChange={(e) => setForm(prev => ({ ...prev, environmentTips: e.target.value }))}
                  placeholder="e.g., Put the book on tv table"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 How will you remember this habit?</div>
              </div>
            </div>
          )}
          
          {/* Step 2: Law 2 - Make it Attractive */}
          {step === 2 && (
            <>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">Law 2: Make it Attractive</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">Bundle habits you need to do with habits you want to do.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Temptation Bundling</label>
                <Input
                  value={form.makeAttractive}
                  onChange={(e) => setForm(prev => ({ ...prev, makeAttractive: e.target.value }))}
                  placeholder="e.g., Use lemon water, listen to favorite music while exercising"
                />
              </div>
            </>
          )}
          
          {/* Step 3: Law 3 - Make it Easy */}
          {step === 3 && (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">Law 3: Make it Easy</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">Reduce friction. Downscale to a 2-minute version.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">2-Minute Version</label>
                <Input
                  value={form.makeEasy}
                  onChange={(e) => setForm(prev => ({ ...prev, makeEasy: e.target.value }))}
                  placeholder="e.g., Just take 2 sips of water, Just put on workout clothes"
                />
              </div>
            </>
          )}
          
          {/* Step 4: Law 4 & Schedule */}
          {step === 4 && (
            <>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-2">Law 4: Make it Satisfying</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">What gets rewarded gets repeated. Track your progress.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Immediate Reward / Progress Tracking</label>
                <Input
                  value={form.makeSatisfying}
                  onChange={(e) => setForm(prev => ({ ...prev, makeSatisfying: e.target.value }))}
                  placeholder="e.g., Take 1 glass, Check off calendar, Feel energized"
                />
              </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Repeat Schedule</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }))}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }))}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, schedule: ['Sat', 'Sun'] }))}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                >
                  Weekends
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, schedule: [] }))}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const schedule = form.schedule || []
                      const newSchedule = schedule.includes(day) 
                        ? schedule.filter(d => d !== day)
                        : [...schedule, day]
                      setForm(prev => ({ ...prev, schedule: newSchedule }))
                    }}
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all transform hover:scale-105 ${
                      (form.schedule || []).includes(day)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
            </>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex space-x-2 pt-2">
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button type="button" onClick={handleNext} className="flex-1" disabled={step === 1 && (!form.newHabit.trim() || !form.time || !form.identity)}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={!form.newHabit.trim() || !form.time || !form.identity}>
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      {showAddModal.isOpen && (
        <Modal 
            isOpen={showAddModal.isOpen} 
            onClose={() => setShowAddModal({ type: '', isOpen: false })} 
            title={`Add New ${showAddModal.type}`}
          >
            <div className="space-y-4">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder={`Enter new ${showAddModal.type}`}
                autoFocus
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleAddNew(showAddModal.type, newOption)}
                  disabled={!newOption.trim()}
                  className="flex-1"
                >
                  Add
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowAddModal({ type: '', isOpen: false })}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
      )}
    </>
  )
}