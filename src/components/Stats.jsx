import { TrendingUp, Target, Calendar, Award } from 'lucide-react'
import Card from './ui/Card'

const Stats = ({ habits }) => {
  const today = new Date().toDateString()
  
  const stats = {
    totalHabits: habits.length,
    completedToday: habits.filter(habit => 
      habit.completions[today] >= (habit.target || 1)
    ).length,
    longestStreak: Math.max(...habits.map(habit => habit.streak), 0),
    totalCompletions: habits.reduce((sum, habit) => 
      sum + Object.values(habit.completions).reduce((a, b) => a + b, 0), 0
    )
  }

  const completionRate = stats.totalHabits > 0 
    ? Math.round((stats.completedToday / stats.totalHabits) * 100)
    : 0

  const statCards = [
    {
      title: 'Total Habits',
      value: stats.totalHabits,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Completed Today',
      value: `${stats.completedToday}/${stats.totalHabits}`,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      icon: Award,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-all duration-200">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  )
}

export default Stats