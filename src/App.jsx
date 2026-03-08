import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import BottomNav from './components/BottomNav'
import HabitsModule from './modules/habits/HabitsModule'
import TodosModule from './modules/todos/TodosModule'
import ExpensesModule from './modules/expenses/ExpensesModule'
import OnboardingTour from './components/OnboardingTour'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import { useGlobalShortcuts } from './hooks/useKeyboardShortcut'

function App() {
  const [activeModule, setActiveModule] = useState('habits')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [useBottomNav, setUseBottomNav] = useState(() => window.innerWidth < 768)
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    } catch {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })

  useEffect(() => {
    const handleResize = () => setUseBottomNav(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
  }

  useGlobalShortcuts(activeModule, setActiveModule, toggleDarkMode, () => setShowShortcuts(true))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!useBottomNav && (
        <Navigation activeTab={activeModule} onTabChange={setActiveModule} isDark={isDark} setIsDark={setIsDark} onShowShortcuts={() => setShowShortcuts(true)} />
      )}
      <main className={`max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 ${useBottomNav ? 'pb-24' : 'pb-6'}`}>
        <div className="animate-fade-in">
          {activeModule === 'habits' && <HabitsModule />}
          {activeModule === 'todos' && <TodosModule />}
          {activeModule === 'expenses' && <ExpensesModule />}
          {activeModule === 'stats' && <div className="text-center py-20"><h2 className="text-2xl font-bold">Stats Coming Soon</h2></div>}
        </div>
      </main>
      {useBottomNav && <BottomNav activeTab={activeModule} onTabChange={setActiveModule} />}
      <OnboardingTour module={activeModule} />
      {showShortcuts && <KeyboardShortcuts module={activeModule} onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}

export default App
