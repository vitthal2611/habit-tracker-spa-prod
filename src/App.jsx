import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import BottomNav from './components/BottomNav'
import HabitsModule from './modules/habits/HabitsModule'
import TodosModule from './modules/todos/TodosModule'
import ExpensesModule from './modules/expenses/ExpensesModule'
import StatsModule from './modules/stats/StatsModule'
import OnboardingTour from './components/OnboardingTour'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary'
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
          {activeModule === 'habits' && (
            <ModuleErrorBoundary 
              moduleName="Habits" 
              fallbackMessage="Your habits module encountered an error. Your data is safe."
              onGoHome={() => setActiveModule('todos')}
            >
              <HabitsModule />
            </ModuleErrorBoundary>
          )}
          {activeModule === 'todos' && (
            <ModuleErrorBoundary 
              moduleName="Tasks" 
              fallbackMessage="Your tasks module encountered an error. Your data is safe."
              onGoHome={() => setActiveModule('habits')}
            >
              <TodosModule />
            </ModuleErrorBoundary>
          )}
          {activeModule === 'expenses' && (
            <ModuleErrorBoundary 
              moduleName="Expenses" 
              fallbackMessage="Your expenses module encountered an error. Your data is safe."
              onGoHome={() => setActiveModule('habits')}
            >
              <ExpensesModule />
            </ModuleErrorBoundary>
          )}
          {activeModule === 'stats' && (
            <ModuleErrorBoundary 
              moduleName="Stats" 
              fallbackMessage="Your stats module encountered an error. Your data is safe."
              onGoHome={() => setActiveModule('habits')}
            >
              <StatsModule />
            </ModuleErrorBoundary>
          )}
        </div>
      </main>
      {useBottomNav && <BottomNav activeTab={activeModule} onTabChange={setActiveModule} />}
      <OnboardingTour module={activeModule} />
      {showShortcuts && <KeyboardShortcuts module={activeModule} onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}

export default App
