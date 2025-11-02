import { useState } from 'react'
import { Check, Flame, Calendar, Trash2, Edit } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'

const HabitCard = ({ habit, onToggleCompletion, onDelete, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  const today = new Date().toDateString()
  const isCompletedToday = habit.completions[today] >= (habit.target || 1)
  
  const categoryColors = {
    health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    productivity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    learning: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    mindfulness: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    social: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }

  const getWeekProgress = () => {
    const week = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toDateString()
      const completed = habit.completions[dateString] >= (habit.target || 1)
      
      week.push({
        date: dateString,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        completed,
        isToday: dateString === today.toDateString()
      })
    }
    
    return week
  }

  const handleToggle = () => {
    const currentCount = habit.completions[today] || 0
    const newCount = currentCount >= habit.target ? 0 : currentCount + 1
    onToggleCompletion(habit.id, today, newCount)
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200 animate-fade-in">
      <Card.Content className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {habit.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[habit.category]}`}>
                {habit.category}
              </span>
            </div>
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {habit.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Flame className="w-4 h-4" />
                <span>{habit.streak} day streak</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Target: {habit.target}/day</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={isCompletedToday ? 'success' : 'outline'}
              size="sm"
              onClick={handleToggle}
              className={`transition-all duration-200 ${
                isCompletedToday ? 'animate-bounce-in' : ''
              }`}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDelete(habit.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex space-x-1">
          {getWeekProgress().map((day, index) => (
            <div
              key={index}
              className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                day.completed
                  ? 'bg-success-500 text-white'
                  : day.isToday
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 border-2 border-primary-500'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {day.day[0]}
            </div>
          ))}
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Created:</strong> {new Date(habit.createdAt).toLocaleDateString()}</p>
              <p><strong>Today's Progress:</strong> {habit.completions[today] || 0}/{habit.target}</p>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

export default HabitCard