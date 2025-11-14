import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DailyHabitView({ habits, onToggle }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
  }

  const getDayHabits = () => {
    const dateStr = currentDate.toDateString()
    const dayName = currentDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = currentDate.toISOString().split('T')[0]

    return habits
      .filter(habit => {
        const isScheduledByDay = !habit.schedule || habit.schedule.length === 0 || habit.schedule.includes(dayName)
        const isScheduledByDate = habit.specificDates && habit.specificDates.includes(dateKey)
        const isCompleted = habit.completions && habit.completions[dateStr]
        return (isScheduledByDay || isScheduledByDate) && !isCompleted
      })
      .sort((a, b) => {
        const timeA = a.time || 'ZZ:ZZ'
        const timeB = b.time || 'ZZ:ZZ'
        if (timeA === 'Anytime') return 1
        if (timeB === 'Anytime') return -1
        return timeA.localeCompare(timeB)
      })
  }

  const dayHabits = getDayHabits()
  const dateStr = currentDate.toDateString()
  
  // Calculate motivational metrics
  const totalScheduled = habits.filter(h => {
    const dayName = currentDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = currentDate.toISOString().split('T')[0]
    const isScheduledByDay = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
    const isScheduledByDate = h.specificDates && h.specificDates.includes(dateKey)
    return isScheduledByDay || isScheduledByDate
  })
  
  const completedToday = totalScheduled.filter(h => h.completions && h.completions[dateStr]).length
  const completionRate = totalScheduled.length > 0 ? Math.round((completedToday / totalScheduled.length) * 100) : 0
  
  // Calculate streak for today
  const getStreak = () => {
    let streak = 0
    const today = new Date(currentDate)
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const checkDateStr = checkDate.toDateString()
      const dayName = checkDate.toLocaleDateString('en', { weekday: 'short' })
      
      const dayHabits = habits.filter(h => {
        const isScheduled = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
        return isScheduled
      })
      
      if (dayHabits.length === 0) continue
      
      const completed = dayHabits.filter(h => h.completions && h.completions[checkDateStr]).length
      if (completed === dayHabits.length) {
        streak++
      } else {
        break
      }
    }
    return streak
  }
  
  const currentStreak = getStreak()
  const remaining = dayHabits.length

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      {/* Identity Statement - James Clear Style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your Identity Today</div>
        <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
          "I am the type of person who {completedToday > 0 ? 'shows up every day' : 'never misses twice'}"
        </div>
        <div className="mt-3 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">{completedToday} completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">{currentStreak} day streak</span>
          </div>
        </div>
      </div>
      

      
      {/* Date Navigation - Minimal */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateDay(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(currentDate)}</div>
        </div>
        
        <button
          onClick={() => navigateDay(1)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {dayHabits.length === 0 ? (
        <div className="text-center py-12 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-4xl mb-3">✓</div>
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-1">All habits completed</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">You showed up today. That's what matters.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {dayHabits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors shadow-sm"
            >
              {/* Header: Identity + Streak */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => onToggle(habit.id, dateStr)}
                    className="w-6 h-6 mt-0.5 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                  </button>
                  
                  <div className="flex-1">
                    {habit.identity && (
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                        Identity: I am {habit.identity}
                      </div>
                    )}
                  </div>
                </div>
                
                {habit.streak > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Overall Streak</div>
                    <div className="text-lg font-bold text-orange-500">{String(habit.streak).padStart(2, '0')}</div>
                  </div>
                )}
              </div>
              
              {/* Implementation Intention */}
              <div className="mb-3 pl-9">
                <div className="flex items-start gap-2">
                  {habit.time && (
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {habit.time}:
                    </span>
                  )}
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {habit.currentHabit && habit.newHabit 
                      ? `After ${habit.currentHabit}${habit.location ? ` at ${habit.location}` : ''}, I will ${habit.newHabit}`
                      : habit.newHabit || habit.habit || 'No description'}
                  </div>
                </div>
              </div>
              
              {/* Make it Easy - Tiny Version */}
              {habit.makeEasy && (
                <div className="mb-2 pl-9 bg-green-50 dark:bg-green-900/20 rounded p-2 border-l-2 border-green-400">
                  <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Tiny Version:</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">{habit.makeEasy}</div>
                </div>
              )}
              
              {/* Make it Attractive */}
              {habit.makeAttractive && (
                <div className="mb-2 pl-9 bg-purple-50 dark:bg-purple-900/20 rounded p-2 border-l-2 border-purple-400">
                  <div className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">Attractive:</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">{habit.makeAttractive}</div>
                </div>
              )}
              
              {/* Current Progress / Make it Satisfying */}
              {habit.makeSatisfying && (
                <div className="pl-9 bg-blue-50 dark:bg-blue-900/20 rounded p-2 border-l-2 border-blue-400">
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Current Progress:</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">{habit.makeSatisfying}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Atomic Habits Wisdom */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-gray-300 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remember</div>
        <div className="text-sm text-gray-700 dark:text-gray-300 italic">
          {remaining === 0 
            ? '"You do not rise to the level of your goals. You fall to the level of your systems."'
            : remaining === 1
            ? '"Every action you take is a vote for the type of person you wish to become."'
            : currentStreak > 0
            ? '"The secret to getting results is to never miss twice."'
            : '"Habits are the compound interest of self-improvement."'
          }
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">— James Clear, Atomic Habits</div>
      </div>
    </div>
  )
}
