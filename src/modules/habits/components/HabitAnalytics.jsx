import { X, TrendingUp, Clock, Calendar } from 'lucide-react'

export default function HabitAnalytics({ habits, onClose }) {
  const getAnalytics = () => {
    const analytics = habits.map(habit => {
      const completions = Object.entries(habit.completions || {}).filter(([_, v]) => v)
      const total = completions.length
      const timePattern = {}
      const dayPattern = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
      
      completions.forEach(([dateStr]) => {
        const date = new Date(dateStr)
        const day = date.toLocaleDateString('en', { weekday: 'short' })
        dayPattern[day]++
        if (habit.time) timePattern[habit.time] = (timePattern[habit.time] || 0) + 1
      })
      
      const bestDay = Object.entries(dayPattern).sort((a, b) => b[1] - a[1])[0]
      const rate = total > 0 ? Math.round((total / Object.keys(habit.completions || {}).length) * 100) : 0
      
      return { habit, total, rate, bestDay, dayPattern }
    })
    return analytics.sort((a, b) => b.rate - a.rate)
  }

  const analytics = getAnalytics()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Analytics</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {analytics.map(({ habit, total, rate, bestDay, dayPattern }) => (
            <div key={habit.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">{habit.newHabit || habit.habit}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{rate}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Best Day</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{bestDay[0]}</p>
                  </div>
                </div>
                {habit.time && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Scheduled Time</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{habit.time}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">{total}</div>
                  <div>
                    <p className="text-sm text-gray-500">Total Completions</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{total}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Weekly Pattern</p>
                <div className="flex gap-1">
                  {Object.entries(dayPattern).map(([day, count]) => (
                    <div key={day} className="flex-1 text-center">
                      <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded relative overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-indigo-600" style={{ height: `${Math.min((count / Math.max(...Object.values(dayPattern))) * 100, 100)}%` }} />
                      </div>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{day}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
