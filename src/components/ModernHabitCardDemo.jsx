import { useState } from 'react'
import ModernHabitCard from './ModernHabitCard'

export default function ModernHabitCardDemo() {
  const [theme, setTheme] = useState('minimal')
  
  const sampleHabit = {
    id: 'demo-1',
    identity: 'Healthy Person',
    currentHabit: 'wake up',
    newHabit: 'Drink a glass of water',
    twoMinVersion: 'Fill glass with water',
    time: '07:00',
    location: 'Kitchen',
    cue: 'Place glass on nightstand',
    reward: 'Feel refreshed and energized',
    completions: {
      'Mon Dec 16 2024': true,
      'Tue Dec 17 2024': true,
      'Wed Dec 18 2024': false,
      'Thu Dec 19 2024': true
    },
    schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }

  const today = new Date().toDateString()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">
            Modern Habit Card Design
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Clean, modern, and highly user-friendly habit tracking cards with clear visual hierarchy
          </p>
        </div>

        {/* Theme Selector */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTheme('minimal')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                theme === 'minimal'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Minimal White
            </button>
            <button
              onClick={() => setTheme('vibrant')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                theme === 'vibrant'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vibrant Gradient
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dark Mode
            </button>
          </div>
        </div>

        {/* Card Display */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Pending State
            </h3>
            <ModernHabitCard
              habit={sampleHabit}
              dateStr={today}
              theme={theme}
              onComplete={() => alert('Completed!')}
              onSkip={() => alert('Skipped!')}
              onDelete={() => alert('Deleted!')}
              onEdit={() => alert('Edit!')}
            />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Completed State
            </h3>
            <ModernHabitCard
              habit={{
                ...sampleHabit,
                completions: { ...sampleHabit.completions, [today]: true }
              }}
              dateStr={today}
              theme={theme}
              onDelete={() => alert('Deleted!')}
              onEdit={() => alert('Edit!')}
            />
          </div>
        </div>

        {/* Design Guide */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
            UI Style Guide
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                  Visual Hierarchy
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Identity: Subtle header, uppercase, small</li>
                  <li>• Trigger: Soft background, left accent bar</li>
                  <li>• Action: Bold gradient, largest text, centered</li>
                  <li>• Supporting: Icon + label, color-coded</li>
                  <li>• Days: Compact grid, clear active state</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                  Typography
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Identity: 12px, uppercase, medium weight</li>
                  <li>• Trigger: 14px, regular weight</li>
                  <li>• Action: 20-24px, bold/black weight</li>
                  <li>• Meta: 14px, regular weight</li>
                  <li>• Labels: 12px, bold, uppercase</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                  Color System
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Primary: Indigo/Purple gradient</li>
                  <li>• Success: Green (completed)</li>
                  <li>• Warning: Orange (skipped)</li>
                  <li>• Info: Blue (trigger, cue)</li>
                  <li>• Accent: Yellow (2-min), Pink (reward)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                  Spacing & Layout
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Card padding: 20px</li>
                  <li>• Section gaps: 16px</li>
                  <li>• Border radius: 16px (card), 12px (inner)</li>
                  <li>• Icon size: 16-20px</li>
                  <li>• Button height: 48px</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
              Key Design Principles
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-bold text-gray-900 dark:text-white mb-1">Scannable</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Clear visual flow from trigger to action
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-2xl mb-2">✨</div>
                <div className="font-bold text-gray-900 dark:text-white mb-1">Minimal Clutter</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Only essential information visible
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-bold text-gray-900 dark:text-white mb-1">Color Hierarchy</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Action block stands out prominently
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-black mb-4">Implementation Notes</h2>
          <div className="space-y-3 text-sm opacity-90">
            <p>✓ Responsive design with mobile-first approach</p>
            <p>✓ Smooth transitions and hover states</p>
            <p>✓ Accessible with proper contrast ratios</p>
            <p>✓ Icon consistency using lucide-react</p>
            <p>✓ Three theme variations for different preferences</p>
            <p>✓ Clear visual feedback for completed/skipped states</p>
          </div>
        </div>
      </div>
    </div>
  )
}
