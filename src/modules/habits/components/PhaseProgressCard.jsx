import { useState } from 'react'
import { ChevronRight, Check, Plus, Trash2 } from 'lucide-react'

export default function PhaseProgressCard({ habit, onUpdate }) {
  const [showPhaseBuilder, setShowPhaseBuilder] = useState(false)
  const [phases, setPhases] = useState(habit.phases || [])
  const [newPhase, setNewPhase] = useState({ action: '', days: 7 })

  const currentPhase = phases.find((_, idx) => idx === habit.currentPhase) || phases[0]
  const progress = currentPhase ? (currentPhase.completedDays || 0) / currentPhase.days * 100 : 0

  const addPhase = () => {
    if (newPhase.action.trim()) {
      setPhases([...phases, { ...newPhase, completed: false, completedDays: 0 }])
      setNewPhase({ action: '', days: 7 })
    }
  }

  const advancePhase = () => {
    if (habit.currentPhase < phases.length - 1) {
      onUpdate({ ...habit, currentPhase: habit.currentPhase + 1 })
    }
  }

  const savePhases = () => {
    onUpdate({ ...habit, phases, currentPhase: 0 })
    setShowPhaseBuilder(false)
  }

  if (!habit.phases || habit.phases.length === 0) {
    return (
      <button
        onClick={() => setShowPhaseBuilder(true)}
        className="w-full px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Difficulty Progression
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
          Phase {habit.currentPhase + 1} of {phases.length}
        </span>
        <button
          onClick={() => setShowPhaseBuilder(true)}
          className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
        >
          Edit
        </button>
      </div>
      
      <p className="font-bold text-gray-900 dark:text-white mb-3">{currentPhase?.action}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress:</span>
          <span className="font-semibold">{currentPhase?.completedDays || 0} / {currentPhase?.days} days</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {progress >= 100 && habit.currentPhase < phases.length - 1 && (
        <button
          onClick={advancePhase}
          className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2"
        >
          Advance to Phase {habit.currentPhase + 2} <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {showPhaseBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Difficulty Progression</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Break down your habit into easier phases (2-minute rule)</p>
            
            <div className="space-y-3 mb-4">
              {phases.map((phase, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400">Phase {idx + 1}:</span>
                    <button
                      onClick={() => setPhases(phases.filter((_, i) => i !== idx))}
                      className="ml-auto text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={phase.action}
                    onChange={(e) => {
                      const newPhases = [...phases]
                      newPhases[idx].action = e.target.value
                      setPhases(newPhases)
                    }}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 mb-2"
                    placeholder="Action (e.g., Put on running shoes)"
                  />
                  <input
                    type="number"
                    value={phase.days}
                    onChange={(e) => {
                      const newPhases = [...phases]
                      newPhases[idx].days = parseInt(e.target.value) || 7
                      setPhases(newPhases)
                    }}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Days"
                    min="1"
                  />
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Add New Phase</p>
              <input
                type="text"
                value={newPhase.action}
                onChange={(e) => setNewPhase({ ...newPhase, action: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-2"
                placeholder="Action"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newPhase.days}
                  onChange={(e) => setNewPhase({ ...newPhase, days: parseInt(e.target.value) || 7 })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Days"
                  min="1"
                />
                <button onClick={addPhase} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPhaseBuilder(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={savePhases}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
