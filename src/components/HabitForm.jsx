import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import Dropdown from './ui/Dropdown'
import Modal from './ui/Modal'

export default function HabitForm({ isOpen, onClose, onSubmit, habits, editingHabit = null }) {
  const [form, setForm] = useState(editingHabit || {
    identity: '', habit: '', location: '', time: '', 
    environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: []
  })
  const [showAddModal, setShowAddModal] = useState({ type: '', isOpen: false })
  const [newOption, setNewOption] = useState('')

  const identities = [...new Set(habits.map(h => h.identity).filter(Boolean))]
  const locations = [...new Set(habits.map(h => h.location).filter(Boolean))]
  
  const timeOptions = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00', '23:00', 'Anytime'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.habit.trim() || !form.time) return
    
    const habitData = editingHabit 
      ? { ...form }
      : { ...form, id: `habit_${Date.now()}`, completed: false, streak: 0, completions: {}, createdAt: new Date().toISOString() }
    
    onSubmit(habitData)
    setForm({ identity: '', habit: '', location: '', time: '', environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: [] })
    onClose()
  }

  const handleAddNew = (type, value) => {
    setForm(prev => ({ ...prev, [type]: value }))
    setNewOption('')
    setShowAddModal({ type: '', isOpen: false })
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={editingHabit ? "Edit Habit" : "Create New Habit"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Dropdown
            label="Identity"
            options={identities}
            value={form.identity}
            onChange={(value) => setForm(prev => ({ ...prev, identity: value }))}
            onAddNew={() => setShowAddModal({ type: 'identity', isOpen: true })}
            placeholder="Who do you want to become?"
          />
          
          <div>
            <label className="block text-sm font-medium mb-1">Habit *</label>
            <Input
              value={form.habit}
              onChange={(e) => setForm(prev => ({ ...prev, habit: e.target.value }))}
              placeholder="I will read for 10 minutes"
              required
            />
          </div>
          
          <Dropdown
            label="Location"
            options={locations}
            value={form.location}
            onChange={(value) => setForm(prev => ({ ...prev, location: value }))}
            onAddNew={() => setShowAddModal({ type: 'location', isOpen: true })}
            placeholder="Where will you do it?"
          />
          
          <Dropdown
            label="Time *"
            options={timeOptions}
            value={form.time}
            onChange={(value) => setForm(prev => ({ ...prev, time: value }))}
            placeholder="Select time"
            required
          />
          
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
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button type="submit" className="flex-1" disabled={!form.habit.trim() || !form.time}>
              {editingHabit ? 'Update Habit' : 'Create Habit'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      {showAddModal.isOpen && showAddModal.type !== 'currentHabit' && (
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