import { useState } from 'react'
import { Target, Calendar, TrendingUp, Plus, CheckCircle2, Clock, MapPin, Zap, BarChart3, Activity, Star } from 'lucide-react'

export default function EnhancedDashboard({ 
  habits, 
  totalHabits, 
  completedToday, 
  completionRate, 
  onAddHabit, 
  viewMode, 
  setViewMode, 
  isSelectionMode,
  selectedHabits,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  setIsSelectionMode
}) {


  // Calculate daily progress metrics
  const getDailyProgress = () => {
    const today = new Date().toDateString()
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    const dayName = todayDate.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = todayDate.toISOString().split('T')[0]
    
    const todayHabits = habits.filter(h => {
      const habitStartDate = new Date(h.createdAt || h.id)
      if (isNaN(habitStartDate.getTime())) return false
      habitStartDate.setHours(0, 0, 0, 0)
      
      if (todayDate < habitStartDate) return false
      
      const isScheduledByDay = !h.schedule || h.schedule.length === 0 || h.schedule.includes(dayName)
      const isScheduledByDate = h.specificDates && h.specificDates.includes(dateKey)
      return isScheduledByDay || isScheduledByDate
    })

    const completed = todayHabits.filter(h => h.completions && h.completions[today] === true).length
    const skipped = todayHabits.filter(h => h.completions && h.completions[today] === false).length
    const pending = todayHabits.length - completed - skipped

    return { completed, skipped, pending, total: todayHabits.length }
  }

  // Get habit categories with time-based grouping
  const getHabitCategories = () => {
    const categories = [
      { 
        title: 'Morning', 
        icon: '🌅', 
        color: 'from-amber-400 to-orange-500',
        timeRange: '5:00 AM - 11:59 AM',
        habits: habits.filter(h => {
          if (!h.time || h.time === 'Anytime') return false
          const hour = parseInt(h.time.split(':')[0])
          return hour >= 5 && hour < 12
        })
      },
      { 
        title: 'Afternoon', 
        icon: '☀️', 
        color: 'from-blue-400 to-cyan-500',
        timeRange: '12:00 PM - 4:59 PM',
        habits: habits.filter(h => {
          if (!h.time || h.time === 'Anytime') return false
          const hour = parseInt(h.time.split(':')[0])
          return hour >= 12 && hour < 17
        })
      },
      { 
        title: 'Evening', 
        icon: '🌆', 
        color: 'from-purple-400 to-pink-500',
        timeRange: '5:00 PM - 11:59 PM',
        habits: habits.filter(h => {
          if (!h.time || h.time === 'Anytime') return false
          const hour = parseInt(h.time.split(':')[0])
          return hour >= 17 && hour < 24
        })
      },
      { 
        title: 'Anytime', 
        icon: '⏰', 
        color: 'from-gray-400 to-gray-600',
        timeRange: 'Flexible timing',
        habits: habits.filter(h => !h.time || h.time === 'Anytime')
      }
    ]
    return categories.filter(cat => cat.habits.length > 0)
  }

  const dailyProgress = getDailyProgress()
  const habitCategories = getHabitCategories()
  const progressPercentage = dailyProgress.total > 0 ? (dailyProgress.completed / dailyProgress.total) * 100 : 0

  return (
    <div className="space-y-6 sm:space-y-8 px-1">
      {/* Mobile-First Header */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Track your daily habits and build consistency
          </p>
        </div>
        
        {/* Mobile Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {habits.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-2 order-2 sm:order-1">
              {isSelectionMode ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={onSelectAll}
                    className="flex-1 sm:flex-none px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors min-h-[48px]"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={onClearSelection}
                    className="flex-1 sm:flex-none px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors min-h-[48px]"
                  >
                    Cancel
                  </button>
                  {selectedHabits.size > 0 && (
                    <button 
                      onClick={onDeleteSelected}
                      className="flex-1 sm:flex-none px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors min-h-[48px]"
                    >
                      Delete ({selectedHabits.size})
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsSelectionMode(true)}
                  className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors min-h-[48px]"
                >
                  Select
                </button>
              )}
            </div>
          )}
          
          {/* Sticky Add Button for Mobile */}
          <button 
            onClick={onAddHabit}
            className="order-1 sm:order-2 w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-strong hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[56px] sm:min-h-[48px]"
          >
            <Plus className="w-6 h-6" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Enhanced Summary Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Habits Card */}
        <div className="dashboard-card bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-strong border border-gray-100 dark:border-gray-700 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-strong">
              <Target className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-200 dark:border-blue-800">
              TOTAL
            </span>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{totalHabits}</h3>
            <p className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400">Active habits</p>
          </div>
        </div>

        {/* Today Completed Card */}
        <div className="dashboard-card bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-strong border border-gray-100 dark:border-gray-700 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-strong">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
              TODAY
            </span>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              {completedToday}
              <span className="text-xl sm:text-2xl text-gray-400 font-normal">/{totalHabits}</span>
            </h3>
            <p className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400">Completed today</p>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="dashboard-card bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-strong border border-gray-100 dark:border-gray-700 hover:shadow-2xl sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-strong">
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-purple-200 dark:border-purple-800">
              RATE
            </span>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{completionRate}%</h3>
            <p className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400">Success rate</p>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Segmented Control */}
      <div className="flex justify-center px-2">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-strong border border-gray-200 dark:border-gray-700 w-full max-w-md sm:max-w-none sm:w-auto">
          {[
            { key: 'today', label: 'Today', icon: Calendar },
            { key: 'weekly', label: 'Weekly', icon: BarChart3 },
            { key: 'table', label: 'Table', icon: Activity }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`segmented-control flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 min-h-[48px] ${
                viewMode === key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-strong transform scale-105 border border-gray-200 dark:border-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Daily Progress Section - Mobile First */}
      {totalHabits > 0 && (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-strong border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">
              Today's Progress
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Keep building your habits consistently
            </p>
          </div>

          {/* Mobile-Optimized Progress Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-strong transform hover:scale-110 transition-transform duration-300">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{dailyProgress.completed}</span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-black text-gray-900 dark:text-white mb-1">DONE</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-strong transform hover:scale-110 transition-transform duration-300">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{dailyProgress.skipped}</span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-black text-gray-900 dark:text-white mb-1">SKIPPED</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Missed today</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-strong transform hover:scale-110 transition-transform duration-300">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{dailyProgress.total}</span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-black text-gray-900 dark:text-white mb-1">TOTAL</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
            </div>
          </div>

          {/* Enhanced Mobile-Friendly Progress Bar */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-medium">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">Daily Progress</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="relative h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div 
                className="progress-bar absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-strong animate-progress-fill"
                style={{ width: `${progressPercentage}%`, '--progress-width': `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute right-0 top-0 w-1 sm:w-2 h-full bg-white/50 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Habit Categories */}
      {habitCategories.length > 0 && (
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">
              Habit Categories
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Organize your habits by time of day
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {habitCategories.map((category, index) => (
              <div 
                key={category.title}
                className="category-card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-strong border border-gray-100 dark:border-gray-700 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${category.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-strong`}>
                      <span className="text-2xl sm:text-3xl">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{category.title}</h3>
                      <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">{category.timeRange}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{category.habits.length}</div>
                    <div className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">habits</div>
                  </div>
                </div>
                
                {/* Mobile-Optimized Category habits preview */}
                <div className="space-y-2 sm:space-y-3">
                  {category.habits.slice(0, 3).map((habit) => (
                    <div key={habit.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-medium border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {habit.newHabit || habit.habit}
                        </span>
                      </div>
                      {habit.location && (
                        <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">{habit.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {category.habits.length > 3 && (
                    <div className="text-center py-2 sm:py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl sm:rounded-2xl">
                      <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">
                        +{category.habits.length - 3} more habits
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile-Optimized Empty State */}
      {habits.length === 0 && (
        <div className="text-center py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Welcome to Habit Tracker!
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto px-4">
            Start building better habits with our powerful habit stacking system
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-6 sm:mb-8 max-w-lg mx-auto px-4">
            Link new habits to existing ones: "After I [current habit], I will [new habit]"
          </p>
          <button 
            onClick={onAddHabit}
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-h-[48px]"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            Create Your First Habit
          </button>
        </div>
      )}
    </div>
  )
}