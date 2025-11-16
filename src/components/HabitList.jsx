import { useState } from 'react'
import { Check, Clock, MapPin, Link, Trash2, ChevronLeft, ChevronRight, Edit, Download } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Modal from './ui/Modal'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function HabitList({ habits, onToggle, onDelete, onUpdate, groupBy = 'none' }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [editingField, setEditingField] = useState({ habitId: null, field: null })
  const [editValue, setEditValue] = useState('')
  const [sortBy, setSortBy] = useState('time')
  const [sortOrder, setSortOrder] = useState('asc')
  const today = new Date().toDateString()

  const getConsistencyDays = (habit) => {
    const completionDates = Object.keys(habit.completions || {}).filter(date => habit.completions[date])
    if (completionDates.length === 0) return 0
    
    const sortedDates = completionDates.map(d => new Date(d)).sort((a, b) => b - a)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streak = 0
    let checkDate = new Date(today)
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toDateString()
      if (habit.completions[dateStr]) {
        streak++
      } else {
        break
      }
      checkDate.setDate(checkDate.getDate() - 1)
    }
    
    return streak
  }

  const wasMissedYesterday = (habit) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()
    const dayName = yesterday.toLocaleDateString('en', { weekday: 'short' })
    const dateKey = yesterday.toISOString().split('T')[0]
    
    const isScheduledByDay = !habit.schedule || habit.schedule.length === 0 || habit.schedule.includes(dayName)
    const isScheduledByDate = habit.specificDates && habit.specificDates.includes(dateKey)
    const wasScheduled = isScheduledByDay || isScheduledByDate
    
    return wasScheduled && !habit.completions[yesterdayStr]
  }

  const getWeekProgress = (habit) => {
    const week = []
    const today = new Date()
    const todayStr = today.toDateString()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const habitStartDate = new Date(habit.createdAt || habit.id)
    habitStartDate.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + mondayOffset + i + (weekOffset * 7))
      const dateStr = date.toDateString()
      const dayName = date.toLocaleDateString('en', { weekday: 'short' })
      const dateKey = date.toISOString().split('T')[0]
      
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      
      const isBeforeStart = checkDate < habitStartDate
      
      const isScheduledByDay = !habit.schedule || habit.schedule.length === 0 || habit.schedule.includes(dayName)
      const isScheduledByDate = habit.specificDates && habit.specificDates.includes(dateKey)
      const isScheduledDay = (isScheduledByDay || isScheduledByDate) && !isBeforeStart
      
      week.push({
        day: dayName[0],
        date: date.getDate(),
        dateKey: dateStr,
        completed: habit.completions[dateStr] || false,
        isToday: dateStr === todayStr,
        isScheduled: isScheduledDay
      })
    }
    return week
  }

  const getWeekRange = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const start = new Date(today)
    start.setDate(today.getDate() + mondayOffset + (weekOffset * 7))
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    
    return `${start.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
  }

  const toggleDayCompletion = (habitId, dateKey) => {
    onToggle(habitId, dateKey)
  }
  
  const startEdit = (habitId, field, currentValue) => {
    setEditingField({ habitId, field })
    setEditValue(currentValue || '')
  }
  
  const timeOptions = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00', '23:00', 'Anytime'
  ]
  
  const locations = [...new Set(habits.map(h => h.location).filter(Boolean))]
  const identities = [...new Set(habits.map(h => h.identity).filter(Boolean))]
  
  const saveEdit = (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    if (habit && editingField.field) {
      onUpdate({ ...habit, [editingField.field]: editValue })
    }
    setEditingField({ habitId: null, field: null })
    setEditValue('')
  }
  
  const cancelEdit = () => {
    setEditingField({ habitId: null, field: null })
    setEditValue('')
  }
  
  const downloadWeeklyPDF = () => {
    const pdf = new jsPDF('l', 'mm', 'a4')
    const pageWidth = 297
    const margin = 20
    let yPos = margin + 10
    
    // Header with title and date
    pdf.setFontSize(18)
    pdf.setFont(undefined, 'bold')
    pdf.text('Weekly Habit Tracker', margin, yPos)
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    pdf.text(`Week: ${getWeekRange()}`, pageWidth - margin - 60, yPos)
    yPos += 20
    
    // Table structure
    const colWidths = [40, 80, 25, 40, 70] // Identity, Habit, Time, Location, Week Progress
    const colPositions = [margin]
    for (let i = 1; i < colWidths.length; i++) {
      colPositions[i] = colPositions[i-1] + colWidths[i-1]
    }
    
    // Table headers
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.text('Identity', colPositions[0], yPos)
    pdf.text('Habit', colPositions[1], yPos)
    pdf.text('Time', colPositions[2], yPos)
    pdf.text('Location', colPositions[3], yPos)
    pdf.text('Mon Tue Wed Thu Fri Sat Sun', colPositions[4], yPos)
    yPos += 8
    
    // Header line
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPos - 2, pageWidth - margin, yPos - 2)
    yPos += 5
    
    // Habit rows
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(9)
    
    habits.forEach((habit, index) => {
      const weekProgress = getWeekProgress(habit)
      const rowHeight = 15
      
      // Alternate row background
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250)
        pdf.rect(margin, yPos - 3, pageWidth - (margin * 2), rowHeight, 'F')
      }
      
      // Text content with wrapping
      const identity = habit.identity || 'No Identity'
      const habitText = habit.habit || habit.newHabit || 'No Habit'
      const time = habit.time || '--:--'
      const location = habit.location || 'No Location'
      
      pdf.setTextColor(0, 0, 0)
      pdf.text(identity, colPositions[0] + 2, yPos + 8, { maxWidth: colWidths[0] - 4 })
      pdf.text(habitText, colPositions[1] + 2, yPos + 8, { maxWidth: colWidths[1] - 4 })
      pdf.text(time, colPositions[2] + 2, yPos + 8)
      pdf.text(location, colPositions[3] + 2, yPos + 8, { maxWidth: colWidths[3] - 4 })
      
      // Week progress with better formatting
      weekProgress.forEach((day, i) => {
        const x = colPositions[4] + 2 + (i * 9)
        const y = yPos + 5
        
        if (day.completed) {
          pdf.setFillColor(34, 197, 94) // Green
          pdf.circle(x + 2, y, 2, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(8)
          pdf.text('✓', x + 0.5, y + 1)
        } else if (day.isScheduled) {
          pdf.setDrawColor(156, 163, 175) // Gray
          pdf.circle(x + 2, y, 2, 'S')
        } else {
          pdf.setFillColor(229, 231, 235) // Light gray
          pdf.circle(x + 2, y, 2, 'F')
        }
      })
      
      yPos += rowHeight
      
      // New page if needed
      if (yPos > 180) {
        pdf.addPage()
        yPos = margin + 20
        
        // Repeat headers on new page
        pdf.setFontSize(10)
        pdf.setFont(undefined, 'bold')
        pdf.text('Identity', colPositions[0], yPos)
        pdf.text('Habit', colPositions[1], yPos)
        pdf.text('Time', colPositions[2], yPos)
        pdf.text('Location', colPositions[3], yPos)
        pdf.text('Mon Tue Wed Thu Fri Sat Sun', colPositions[4], yPos)
        yPos += 8
        pdf.line(margin, yPos - 2, pageWidth - margin, yPos - 2)
        yPos += 5
        pdf.setFont(undefined, 'normal')
        pdf.setFontSize(9)
      }
    })
    
    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 200)
    
    const weekRange = getWeekRange()
    pdf.save(`Weekly-Habits-${weekRange.replace(/\s/g, '-')}.pdf`)
  }
  
  const formatHabitText = (habit) => {
    return habit.habit || habit.newHabit || '-'
  }

  const groupHabits = (habits, groupBy) => {
    if (groupBy === 'none') return { 'All Habits': habits }
    
    const grouped = habits.reduce((acc, habit) => {
      const key = groupBy === 'identity' ? (habit.identity || 'No Identity') : (habit.location || 'No Location')
      if (!acc[key]) acc[key] = []
      acc[key].push(habit)
      return acc
    }, {})
    
    return grouped
  }

  const sortHabits = (habits, sortBy, sortOrder) => {
    if (sortBy === 'none') return habits
    
    return [...habits].sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'identity':
          aVal = a.identity || ''
          bVal = b.identity || ''
          break
        case 'habit':
          aVal = a.newHabit || ''
          bVal = b.newHabit || ''
          break
        case 'time':
          aVal = a.time || ''
          bVal = b.time || ''
          break
        case 'location':
          aVal = a.location || ''
          bVal = b.location || ''
          break
        case 'quadrant':
          aVal = a.quadrant || ''
          bVal = b.quadrant || ''
          break
        default:
          return 0
      }
      
      const comparison = aVal.localeCompare(bVal)
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }
  
  const sortedHabits = sortHabits(habits, sortBy, sortOrder)
  const groupedHabits = groupHabits(sortedHabits, groupBy)

  return (
    <div className="overflow-x-auto" id="habit-list-container">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Prev</span>
          </button>
          <div className="text-center min-w-[180px]">
            <div className="font-semibold text-xs sm:text-base text-gray-900 dark:text-gray-100">{getWeekRange()}</div>
            <div className={`text-xs font-medium px-2 py-0.5 rounded ${
              weekOffset === 0 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `${weekOffset}w ahead` : `${Math.abs(weekOffset)}w ago`}
            </div>
          </div>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <span className="text-xs sm:text-sm">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Button onClick={downloadWeeklyPDF} size="sm" className="w-full sm:w-auto">
          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /><span className="text-xs sm:text-sm">PDF</span>
        </Button>
      </div>
      {habits.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <div className="text-gray-400 mb-4">No habits created yet</div>
          <p className="text-gray-600 dark:text-gray-400">Create your first habit to start tracking</p>
        </div>
      ) : (
        <div className="space-y-6">
        {Object.entries(groupedHabits).map(([groupName, groupHabits]) => (
          <div key={groupName} className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {groupBy !== 'none' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">{groupName}</h3>
              </div>
            )}
            
            {/* Desktop Header */}
            <div className="hidden lg:grid gap-4 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600" style={{gridTemplateColumns: '120px 200px 80px 120px 280px 120px'}}>
              <button onClick={() => handleSort('identity')} className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-left">
                Identity {sortBy === 'identity' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('habit')} className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-left">
                Habit {sortBy === 'habit' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('time')} className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-left">
                Time {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('location')} className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-left">
                Location {sortBy === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                {getWeekProgress(groupHabits[0] || {completions: {}, schedule: [], specificDates: []}).map((day, i) => (
                  <div key={i} className="text-center">
                    <div className="uppercase text-xs">{day.day}</div>
                    <div className="text-gray-400 dark:text-gray-500 text-xs">{day.date}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase text-center flex items-center justify-center">Actions</div>
            </div>
            
            {/* Desktop Rows */}
            <div className="hidden lg:block">
            {groupHabits.map(habit => (
              <div key={habit.id} className={`grid gap-4 p-4 border-b transition-colors animate-fade-in ${wasMissedYesterday(habit) ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}`} style={{gridTemplateColumns: '120px 200px 80px 120px 280px 120px'}}>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center" title={habit.identity || '-'}>
                  {editingField.habitId === habit.id && editingField.field === 'identity' ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-1 py-0 text-sm border rounded bg-white dark:bg-gray-700"
                      autoFocus
                    >
                      <option value="">Select identity</option>
                      {identities.map(id => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                  ) : (
                    <span 
                      className="break-words overflow-hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'identity', habit.identity)}
                    >
                      {habit.identity || '-'}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  {editingField.habitId === habit.id && editingField.field === 'newHabit' ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-1 py-0 text-sm border rounded bg-white dark:bg-gray-700"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="break-words overflow-hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'newHabit', habit.newHabit)}
                    >
                      {formatHabitText(habit)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center break-words">
                  {editingField.habitId === habit.id && editingField.field === 'time' ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-1 py-0 text-sm border rounded bg-white dark:bg-gray-700"
                      autoFocus
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'time', habit.time)}
                    >
                      {habit.time || '-'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center break-words overflow-hidden">
                  {editingField.habitId === habit.id && editingField.field === 'location' ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-1 py-0 text-sm border rounded bg-white dark:bg-gray-700"
                      autoFocus
                    >
                      <option value="">Select location</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'location', habit.location)}
                    >
                      {habit.location || '-'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-7 gap-1 items-center">
                  {getWeekProgress(habit).map((day, i) => {
                    const dayDate = new Date(day.dateKey)
                    const today = new Date()
                    dayDate.setHours(0,0,0,0)
                    today.setHours(0,0,0,0)
                    const isFuture = dayDate > today
                    return (
                    <div key={i} className="text-center">
                      <button
                        onClick={() => day.isScheduled && !isFuture && toggleDayCompletion(habit.id, day.dateKey)}
                        disabled={!day.isScheduled || isFuture}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          !day.isScheduled || isFuture
                            ? 'bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                            : day.completed 
                            ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer hover:scale-110' 
                            : day.isToday 
                            ? 'bg-blue-500 text-white ring-2 ring-blue-200 hover:bg-blue-600 cursor-pointer hover:scale-110'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer hover:scale-110'
                        }`}
                      >
                        {day.completed ? '✓' : ''}
                      </button>
                    </div>
                    )
                  })}
                </div>
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => onDelete(habit.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 p-1 rounded transition-all"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-center px-2">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{getWeekProgress(habit).filter(day => day.completed).length}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">days</div>
                  </div>
                </div>
              </div>
            ))}
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-2 sm:p-3">
            {groupHabits.map(habit => {
              const consistencyDays = getConsistencyDays(habit)
              const weekProgress = getWeekProgress(habit)
              const completedThisWeek = weekProgress.filter(d => d.completed).length
              return (
              <div key={habit.id} className={`rounded-lg sm:rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${wasMissedYesterday(habit) ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-bold mb-1 truncate">{formatHabitText(habit)}</div>
                      <div className="text-xs opacity-90 truncate">{habit.identity}</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <button onClick={() => onDelete(habit.id)} className="p-1.5 hover:bg-white/20 rounded transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-90">
                    <Clock className="w-3 h-3" />
                    <span className="truncate">{habit.time}</span>
                    <MapPin className="w-3 h-3 ml-1" />
                    <span className="truncate">{habit.location}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{consistencyDays}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{completedThisWeek}/7</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round((completedThisWeek/7)*100)}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Rate</div>
                  </div>
                </div>

                {/* Week Progress */}
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-7 gap-1">
                    {weekProgress.map((day, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">{day.day}</div>
                        <button
                          onClick={() => {
                            const dayDate = new Date(day.dateKey)
                            const today = new Date()
                            dayDate.setHours(0,0,0,0)
                            today.setHours(0,0,0,0)
                            if (day.isScheduled && dayDate <= today) toggleDayCompletion(habit.id, day.dateKey)
                          }}
                          disabled={!day.isScheduled || (() => {
                            const dayDate = new Date(day.dateKey)
                            const today = new Date()
                            dayDate.setHours(0,0,0,0)
                            today.setHours(0,0,0,0)
                            return dayDate > today
                          })()}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                            !day.isScheduled || (() => {
                              const dayDate = new Date(day.dateKey)
                              const today = new Date()
                              dayDate.setHours(0,0,0,0)
                              today.setHours(0,0,0,0)
                              return dayDate > today
                            })()
                              ? 'bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                              : day.completed 
                              ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer active:scale-95' 
                              : day.isToday 
                              ? 'bg-blue-500 text-white ring-2 ring-blue-200 hover:bg-blue-600 cursor-pointer active:scale-95'
                              : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer active:scale-95'
                          }`}
                        >
                          {day.completed ? '✓' : day.date}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )
            })}
            </div>

            
            {groupHabits.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {groupHabits.filter(h => h.completions[today]).length} of {groupHabits.length} completed today
                </span>
              </div>
            )}
          </div>
        ))}
        </div>
      )}
      

    </div>
  )
}