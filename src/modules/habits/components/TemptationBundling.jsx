import { useState } from 'react'
import { Link, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  { need: 'Exercise', want: 'Listen to favorite podcast', rule: 'I can only listen while exercising' },
  { need: 'Clean house', want: 'Listen to music', rule: 'I can only listen while cleaning' },
  { need: 'Study', want: 'Drink coffee', rule: 'I can only drink coffee while studying' },
  { need: 'Work on project', want: 'Sit in favorite chair', rule: 'I can only sit there while working' },
  { need: 'Cook healthy meal', want: 'Watch cooking show', rule: 'I can only watch while cooking' }
]

export default function TemptationBundling({ habit, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [bundle, setBundle] = useState(habit.temptationBundle || { need: '', want: '', rule: '' })

  const applysuggestion = (suggestion) => {
    setBundle(suggestion)
  }

  const save = () => {
    onUpdate({ ...habit, temptationBundle: bundle })
    setShowForm(false)
  }

  if (!habit.temptationBundle) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 flex items-center justify-center gap-2"
      >
        <Link className="w-4 h-4" /> Add Temptation Bundling
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
      <div className="flex items-center gap-2 mb-2">
        <Link className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <span className="font-bold text-yellow-700 dark:text-yellow-400">Temptation Bundle</span>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto text-xs text-yellow-600 dark:text-yellow-400 hover:underline"
        >
          Edit
        </button>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{bundle.rule}"</p>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Temptation Bundling
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Pair something you need to do with something you want to do
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">I need to:</label>
                <input
                  type="text"
                  value={bundle.need}
                  onChange={(e) => setBundle({ ...bundle, need: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Exercise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">I want to:</label>
                <input
                  type="text"
                  value={bundle.want}
                  onChange={(e) => setBundle({ ...bundle, want: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Listen to favorite podcast"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">My rule:</label>
                <input
                  type="text"
                  value={bundle.rule}
                  onChange={(e) => setBundle({ ...bundle, rule: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="I can only [want] while [need]"
                />
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold mb-2 text-gray-900 dark:text-white">Suggestions:</p>
              <div className="space-y-1">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => applySuggestion(s)}
                    className="w-full text-left px-2 py-1 text-xs bg-white dark:bg-gray-700 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  >
                    {s.need} + {s.want}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
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
