import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import HabitsModule from './modules/habits/HabitsModule'
import TodosModule from './modules/todos/TodosModule'
import ExpensesModule from './modules/expenses/ExpensesModule'
import OnboardingTour from './components/OnboardingTour'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import { useGlobalShortcuts } from './hooks/useKeyboardShortcut'

function App() {
  const [activeModule, setActiveModule] = useState('habits')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    } catch {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })

  const toggleDarkMode = () => {
    setIsDark(!isDark)
  }

  useGlobalShortcuts(activeModule, setActiveModule, toggleDarkMode, () => setShowShortcuts(true))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation activeTab={activeModule} onTabChange={setActiveModule} isDark={isDark} setIsDark={setIsDark} onShowShortcuts={() => setShowShortcuts(true)} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
        <div className="animate-fade-in">
          {activeModule === 'habits' && <HabitsModule />}
          {activeModule === 'todos' && <TodosModule />}
          {activeModule === 'expenses' && <ExpensesModule />}
        </div>
      </main>
      <OnboardingTour module={activeModule} />
      {showShortcuts && <KeyboardShortcuts module={activeModule} onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}

export default App
