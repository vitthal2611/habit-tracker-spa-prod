import { useState } from 'react'
import { X, Sparkles, Eye, Heart, Zap, Trophy } from 'lucide-react'

export default function OnboardingHabitFlow({ onComplete, onAddHabit }) {
  const [step, setStep] = useState(1)
  const [scorecard, setScorecard] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [selectedBadHabit, setSelectedBadHabit] = useState(null)

  const replacementSuggestions = {
    'check phone': ['do 1 pushup', 'drink water', 'take 3 deep breaths'],
    'eat junk food': ['eat one piece of fruit', 'drink water', 'chew gum'],
    'watch tv': ['read 1 page', 'stretch for 2 minutes', 'call a friend'],
    'scroll social media': ['write 1 sentence', 'do 5 squats', 'meditate 1 minute'],
    'hit snooze': ['sit up immediately', 'drink water', 'open curtains']
  }

  const addToScorecard = (type) => {
    if (newHabit.trim()) {
      setScorecard([...scorecard, { id: Date.now(), text: newHabit.trim(), type }])
      setNewHabit('')
    }
  }

  const removeFromScorecard = (id) => {
    setScorecard(scorecard.filter(h => h.id !== id))
  }

  const handleNext = () => {
    if (step === 2) {
      const badHabit = scorecard.find(h => h.type === 'bad')
      if (badHabit) setSelectedBadHabit(badHabit)
    }
    setStep(step + 1)
  }

  const getSuggestions = () => {
    if (!selectedBadHabit) return []
    const habitText = selectedBadHabit.text.toLowerCase()
    for (const [key, suggestions] of Object.entries(replacementSuggestions)) {
      if (habitText.includes(key)) return suggestions
    }
    return ['meditate for 1 minute', 'drink a glass of water', 'do 1 pushup']
  }

  const handleCreateHabit = (suggestion) => {
    onAddHabit({
      identity: 'healthy person',
      currentHabit: selectedBadHabit.text,
      newHabit: suggestion,
      twoMinVersion: suggestion,
      time: '',
      location: '',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streak: 0,
      completions: {},
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('hasCompletedOnboarding', 'true')
    onComplete()
  }

  const skipOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-8 h-1 rounded-full transition-all ${i === step ? 'bg-indigo-600 w-12' : i < step ? 'bg-green-500' : 'bg-gray-300'}`} />
            ))}
          </div>
          <button onClick={skipOnboarding} className="text-gray-400 hover:text-gray-600 text-sm">Skip</button>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Build Better Habits</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Based on James Clear's Atomic Habits</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl">
                <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Make it Obvious</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clear cues trigger action</p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl">
                <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Make it Attractive</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pair with what you enjoy</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl">
                <Zap className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Make it Easy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start with 2 minutes</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl">
                <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Make it Satisfying</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress</p>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all">
              Get Started
            </button>
          </div>
        )}

        {/* Step 2: Habit Scorecard */}
        {step === 2 && (
          <div className="p-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">What are your current habits?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">List your daily habits and mark them as good (+), bad (-), or neutral (=)</p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Examples:</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full">Check phone first thing (-)</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">Drink water (+)</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">Make coffee (=)</span>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToScorecard('neutral')}
                placeholder="Type a habit..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
              />
              <button onClick={() => addToScorecard('good')} className="px-4 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600">+</button>
              <button onClick={() => addToScorecard('neutral')} className="px-4 py-3 bg-gray-400 text-white rounded-xl font-bold hover:bg-gray-500">=</button>
              <button onClick={() => addToScorecard('bad')} className="px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600">-</button>
            </div>

            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {scorecard.map(habit => (
                <div key={habit.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  habit.type === 'good' ? 'bg-green-50 dark:bg-green-900/20' :
                  habit.type === 'bad' ? 'bg-red-50 dark:bg-red-900/20' :
                  'bg-gray-50 dark:bg-gray-800'
                }`}>
                  <span className="text-gray-900 dark:text-white">{habit.text}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      habit.type === 'good' ? 'bg-green-500 text-white' :
                      habit.type === 'bad' ? 'bg-red-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {habit.type === 'good' ? '+' : habit.type === 'bad' ? '-' : '='}
                    </span>
                    <button onClick={() => removeFromScorecard(habit.id)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={scorecard.length < 3}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next {scorecard.length < 3 && `(${3 - scorecard.length} more needed)`}
            </button>
          </div>
        )}

        {/* Step 3: Create First Habit */}
        {step === 3 && (
          <div className="p-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Let's improve a bad habit</h2>
            {selectedBadHabit ? (
              <>
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Bad Habit:</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedBadHabit.text}</p>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">Replace it with one of these:</p>

                <div className="space-y-3 mb-6">
                  {getSuggestions().map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleCreateHabit(suggestion)}
                      className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl text-left hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 mb-1">After I {selectedBadHabit.text}</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">I will {suggestion}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                          +
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button onClick={skipOnboarding} className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  I'll create my own habit
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No bad habits found in your scorecard.</p>
                <button onClick={skipOnboarding} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                  Continue to App
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
