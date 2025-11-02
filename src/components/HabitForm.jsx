import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import Dropdown from './ui/Dropdown'
import Modal from './ui/Modal'

export default function HabitForm({ isOpen, onClose, onSubmit, habits }) {
  const [form, setForm] = useState({
    identity: '', currentHabit: '', newHabit: '', location: '', time: '', completionTime: '', 
    environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: []
  })
  const [showAddModal, setShowAddModal] = useState({ type: '', isOpen: false })
  const [newOption, setNewOption] = useState('')

  const identities = [...new Set(habits.map(h => h.identity).filter(Boolean))]
  const currentHabits = [...new Set(habits.map(h => h.currentHabit).filter(Boolean))]
  const locations = [...new Set(habits.map(h => h.location).filter(Boolean))]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.newHabit.trim()) return
    
    onSubmit({ ...form, id: `habit_${Date.now()}`, completed: false, streak: 0, completions: {}, createdAt: new Date().toISOString() })
    setForm({ identity: '', currentHabit: '', newHabit: '', location: '', time: '', completionTime: '', environmentTips: '', makeAttractive: '', makeEasy: '', makeSatisfying: '', schedule: [] })
    onClose()
  }

  const handleAddNew = (type, value) => {
    setForm(prev => ({ ...prev, [type]: value }))
    setNewOption('')
    setShowAddModal({ type: '', isOpen: false })
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create New Habit">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Dropdown
            label="Identity"
            options={identities}
            value={form.identity}
            onChange={(value) => setForm(prev => ({ ...prev, identity: value }))}
            onAddNew={() => setShowAddModal({ type: 'identity', isOpen: true })}
            placeholder="Who do you want to become?"
          />
          
          <Dropdown
            label="After I..."
            options={currentHabits}
            value={form.currentHabit}
            onChange={(value) => setForm(prev => ({ ...prev, currentHabit: value }))}
            onAddNew={() => setShowAddModal({ type: 'currentHabit', isOpen: true })}
            placeholder="After I... (what do you already do?)"
          />
          
          <div>
            <label className="block text-sm font-medium mb-1">I will...</label>
            <Input
              value={form.newHabit}
              onChange={(e) => setForm(prev => ({ ...prev, newHabit: e.target.value }))}
              placeholder="I will... (e.g., read for 10 minutes)"
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <Input
                value={form.completionTime}
                onChange={(e) => setForm(prev => ({ ...prev, completionTime: e.target.value }))}
                placeholder="e.g., 10 minutes"
              />
            </div>
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
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button type="submit" className="flex-1">Create Habit</Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
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