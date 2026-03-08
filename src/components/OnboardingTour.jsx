import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

const tourSteps = {
  habits: [
    { title: 'Welcome to Habits!', description: 'Track and build better habits with habit stacking', target: null },
    { title: 'Add Your First Habit', description: 'Click here to create a new habit. You can link it to existing habits for better success', target: 'add-habit' },
    { title: 'View Modes', description: 'Switch between daily, weekly, and table views to track your progress', target: 'view-modes' },
    { title: 'Templates & Analytics', description: 'Use pre-built templates or analyze your habit patterns', target: 'templates' }
  ],
  todos: [
    { title: 'Welcome to To-Do!', description: 'Organize your tasks and boost productivity', target: null },
    { title: 'Add Tasks', description: 'Create tasks with categories, priorities, and due dates', target: 'add-todo' },
    { title: 'Task Templates', description: 'Use templates for common task lists', target: 'templates' }
  ],
  expenses: [
    { title: 'Welcome to Expenses!', description: 'Track spending and manage your budget', target: null },
    { title: 'Add Transactions', description: 'Record income and expenses with categories', target: 'add-expense' },
    { title: 'Budget & Goals', description: 'Set budgets and track financial goals', target: 'budget' }
  ]
}

export default function OnboardingTour({ module, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [show, setShow] = useState(false)
  const steps = tourSteps[module] || []

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_${module}_completed`)
    if (!hasSeenTour && steps.length > 0) {
      setTimeout(() => setShow(true), 500)
    }
  }, [module])

  const handleComplete = () => {
    localStorage.setItem(`tour_${module}_completed`, 'true')
    setShow(false)
    onComplete?.()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!show || steps.length === 0) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 animate-scale-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
            </div>
            <button onClick={handleSkip} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Skip tour">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            {steps.map((_, idx) => (
              <div key={idx} className={`h-2 flex-1 rounded-full transition-colors ${idx === currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button onClick={handlePrev} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button onClick={handleNext} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-colors flex items-center justify-center gap-2">
              {currentStep < steps.length - 1 ? (
                <>Next <ChevronRight className="w-4 h-4" /></>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
