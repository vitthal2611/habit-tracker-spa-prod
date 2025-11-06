import { useState } from 'react'
import Card from './ui/Card'

export default function EisenhowerMatrix({ habits }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const getQuadrant = (habit) => {
    if (habit.quadrant) {
      return habit.quadrant.substring(0, 2) // Extract Q1, Q2, Q3, Q4
    }
    return 'Q4' // Default to Q4 if no quadrant set
  }
  
  const getQuadrantName = (quadrant) => {
    const names = {
      Q1: 'Do First (Urgent & Important)',
      Q2: 'Schedule (Important, Not Urgent)',
      Q3: 'Delegate (Urgent, Not Important)',
      Q4: 'Eliminate (Neither Urgent nor Important)'
    }
    return names[quadrant]
  }
  
  const getQuadrantColor = (quadrant) => {
    const colors = {
      Q1: 'bg-red-50 border-red-200 text-red-800',
      Q2: 'bg-green-50 border-green-200 text-green-800',
      Q3: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      Q4: 'bg-gray-50 border-gray-200 text-gray-800'
    }
    return colors[quadrant]
  }
  
  const getDateProgress = (date) => {
    const dateStr = date.toDateString()
    const quadrants = { Q1: [], Q2: [], Q3: [], Q4: [] }
    
    habits.forEach(habit => {
      const quadrant = getQuadrant(habit)
      quadrants[quadrant].push(habit)
    })
    
    const progress = {}
    Object.keys(quadrants).forEach(q => {
      const total = quadrants[q].length
      const completed = quadrants[q].filter(h => h.completions[dateStr]).length
      progress[q] = {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        habits: quadrants[q]
      }
    })
    
    return progress
  }
  
  const getDayRange = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }
  
  const progress = getDateProgress(selectedDate)
  const weekDays = getDayRange()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Eisenhower Matrix</h2>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      
      {/* Weekly Progress Overview */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">7-Day Progress Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Quadrant</th>
                {weekDays.map(day => (
                  <th key={day.toDateString()} className="text-center p-2 min-w-16">
                    {day.toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(quadrant => (
                <tr key={quadrant} className="border-b">
                  <td className="p-2 font-medium">{quadrant}</td>
                  {weekDays.map(day => {
                    const dayProgress = getDateProgress(day)[quadrant]
                    return (
                      <td key={day.toDateString()} className="text-center p-2">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          dayProgress.percentage === 100 ? 'bg-green-100 text-green-800' :
                          dayProgress.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {dayProgress.percentage}%
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Q1', 'Q2', 'Q3', 'Q4'].map(quadrant => (
          <Card key={quadrant} className={`${getQuadrantColor(quadrant)} border-2`}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">{getQuadrantName(quadrant)}</h3>
                <div className="text-2xl font-bold">
                  {progress[quadrant].percentage}%
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs mb-1">
                  {progress[quadrant].completed} of {progress[quadrant].total} completed
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className="bg-current h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress[quadrant].percentage}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {progress[quadrant].habits.map(habit => (
                  <div key={habit.id} className="flex items-center space-x-2 text-xs">
                    <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                      habit.completions[selectedDate.toDateString()] 
                        ? 'bg-current text-white' 
                        : 'bg-white'
                    }`}>
                      {habit.completions[selectedDate.toDateString()] && '✓'}
                    </div>
                    <span className="truncate">{habit.habit || habit.newHabit}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}