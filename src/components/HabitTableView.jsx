import { useState } from 'react'
import { Trash2, Download } from 'lucide-react'
import jsPDF from 'jspdf'

export default function HabitTableView({ habits, onDelete, onUpdate }) {
  const [editingCell, setEditingCell] = useState({ habitId: null, field: null })
  const [editValue, setEditValue] = useState('')

  const sortedHabits = [...habits].sort((a, b) => {
    const timeA = a.time || '00:00'
    const timeB = b.time || '00:00'
    return timeA.localeCompare(timeB)
  })

  const startEdit = (habitId, field, currentValue) => {
    setEditingCell({ habitId, field })
    setEditValue(currentValue || '')
  }

  const saveEdit = (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    if (habit && editingCell.field) {
      onUpdate({ ...habit, [editingCell.field]: editValue })
    }
    setEditingCell({ habitId: null, field: null })
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingCell({ habitId: null, field: null })
    setEditValue('')
  }

  const downloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4')
    const pageWidth = 297
    const margin = 10
    let yPos = margin + 10
    
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('Habit Tracker - Detailed View', margin, yPos)
    yPos += 10
    
    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    const headers = ['Step', 'Cue', 'Action', 'Specificity', 'Timing', 'Location', 'Comments']
    const colWidths = [70, 30, 30, 25, 20, 25, 50]
    let xPos = margin
    
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos)
      xPos += colWidths[i]
    })
    yPos += 5
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 5
    
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7)
    
    sortedHabits.forEach((habit, index) => {
      if (yPos > 180) {
        doc.addPage()
        yPos = margin + 10
      }
      
      xPos = margin
      const rowData = [
        `After I ${habit.currentHabit || '-'}, I will ${habit.newHabit || '-'}${habit.time ? ` at ${habit.time}` : ''}${habit.location ? ` in ${habit.location}` : ''}.`,
        habit.currentHabit || '-',
        habit.newHabit || '-',
        'Clear',
        habit.time || '-',
        habit.location || '-',
        (habit.environmentTips || habit.makeAttractive || habit.makeEasy || habit.makeSatisfying || '-').substring(0, 50)
      ]
      
      rowData.forEach((data, i) => {
        const lines = doc.splitTextToSize(data, colWidths[i] - 2)
        doc.text(lines[0] || '', xPos, yPos)
        xPos += colWidths[i]
      })
      
      yPos += 8
    })
    
    doc.save('Habit-Tracker-Table.pdf')
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Habit Details Table</h2>
        <button
          onClick={downloadPDF}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{minWidth: '1200px'}}>
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Step</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Cue</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Specificity</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Timing</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Comments/Suggestions</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedHabits.map((habit, index) => (
              <tr key={habit.id} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {editingCell.habitId === habit.id && editingCell.field === 'step' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                      rows="3"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'step', `After I ${habit.currentHabit || ''}, I will ${habit.newHabit || ''}${habit.time ? ` at ${habit.time}` : ''}${habit.location ? ` in ${habit.location}` : ''}.`)}
                    >
                      After I <span className="font-semibold">{habit.currentHabit || '-'}</span>, I will <span className="font-semibold">{habit.newHabit || '-'}</span>{habit.time && <>, at <span className="font-semibold">{habit.time}</span></>}{habit.location && <>, in <span className="font-semibold">{habit.location}</span></>}.
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {editingCell.habitId === habit.id && editingCell.field === 'currentHabit' ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'currentHabit', habit.currentHabit)}
                    >
                      {habit.currentHabit || '-'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {editingCell.habitId === habit.id && editingCell.field === 'newHabit' ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'newHabit', habit.newHabit)}
                    >
                      {habit.newHabit || '-'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  Clear, specific
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {editingCell.habitId === habit.id && editingCell.field === 'time' ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'time', habit.time)}
                    >
                      {habit.time || '-'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {editingCell.habitId === habit.id && editingCell.field === 'location' ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'location', habit.location)}
                    >
                      {habit.location || '-'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {editingCell.habitId === habit.id && editingCell.field === 'comments' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey ? saveEdit(habit.id) : e.key === 'Escape' && cancelEdit()}
                      className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                      rows="2"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      onDoubleClick={() => startEdit(habit.id, 'comments', habit.environmentTips || habit.makeAttractive || habit.makeEasy || habit.makeSatisfying)}
                    >
                      {habit.environmentTips || habit.makeAttractive || habit.makeEasy || habit.makeSatisfying || '-'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDelete(habit.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 p-2 rounded transition-all"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedHabits.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg mt-4">
          <div className="text-gray-400 mb-2">No habits created yet</div>
          <p className="text-gray-600 dark:text-gray-400">Create your first habit to see it in the table</p>
        </div>
      )}
    </div>
  )
}
