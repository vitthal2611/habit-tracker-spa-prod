import { Eye, Sparkles, Zap, Trophy } from 'lucide-react'

const CUE_SUGGESTIONS = {
  morning: ['After I wake up', 'After I brush my teeth', 'After I make coffee', 'After I shower'],
  evening: ['After I finish dinner', 'Before I go to bed', 'After I change clothes', 'After I turn off TV'],
  location: ['When I enter kitchen', 'When I arrive at gym', 'When I sit at desk', 'When I get in car']
}

export default function HabitStatementPreview({ habit, onUpdate }) {
  const statement = `After I ${habit.cue || '___'}, I will ${habit.action || '___'} in ${habit.location || '___'}`
  const identityStatement = `I am a ${habit.identity || '___'} who ${habit.action || '___'}`

  return (
    <div className="space-y-4">
      {/* Main Statement Preview */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <p className="text-sm font-semibold mb-2 opacity-90">Your Habit Statement:</p>
        <p className="text-2xl font-bold leading-relaxed">{statement}</p>
      </div>

      {/* Identity Statement */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
        <p className="text-xs font-semibold mb-1 opacity-90">Identity-Based:</p>
        <p className="text-lg font-bold">{identityStatement}</p>
      </div>

      {/* Environment Design Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-blue-700 dark:text-blue-400">Make it Obvious</span>
          </div>
          <input
            type="text"
            value={habit.makeObvious || ''}
            onChange={(e) => onUpdate({ ...habit, makeObvious: e.target.value })}
            placeholder="Where will you see the cue?"
            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <span className="font-bold text-pink-700 dark:text-pink-400">Make it Attractive</span>
          </div>
          <input
            type="text"
            value={habit.makeAttractive || ''}
            onChange={(e) => onUpdate({ ...habit, makeAttractive: e.target.value })}
            placeholder="What makes this appealing?"
            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-bold text-green-700 dark:text-green-400">Make it Easy</span>
          </div>
          <input
            type="text"
            value={habit.makeEasy || ''}
            onChange={(e) => onUpdate({ ...habit, makeEasy: e.target.value })}
            placeholder="What's the 2-minute version?"
            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="font-bold text-yellow-700 dark:text-yellow-400">Make it Satisfying</span>
          </div>
          <input
            type="text"
            value={habit.makeSatisfying || ''}
            onChange={(e) => onUpdate({ ...habit, makeSatisfying: e.target.value })}
            placeholder="How will you celebrate?"
            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Cue Suggestions */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Cue Suggestions:</p>
        <div className="space-y-2">
          {Object.entries(CUE_SUGGESTIONS).map(([category, cues]) => (
            <div key={category}>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">{category}:</p>
              <div className="flex flex-wrap gap-1">
                {cues.map(cue => (
                  <button
                    key={cue}
                    onClick={() => onUpdate({ ...habit, cue })}
                    className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    {cue}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
