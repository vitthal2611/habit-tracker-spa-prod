import { useState } from 'react'
import { Clock, MapPin, Zap, Eye, Gift, Trash2, Edit } from 'lucide-react'

export default function ModernHabitCard({ 
  habit, 
  dateStr, 
  onComplete, 
  onSkip, 
  onDelete, 
  onEdit,
  theme = 'minimal' // 'minimal', 'vibrant', 'dark'
}) {
  const [showActions, setShowActions] = useState(false)
  
  const isCompleted = habit.completions?.[dateStr] === true
  const isMissed = habit.completions?.[dateStr] === false
  const isPending = !isCompleted && !isMissed

  const themes = {
    minimal: {
      card: 'bg-white border border-gray-200',
      header: 'bg-gray-50 border-b border-gray-200',
      identity: 'text-gray-600 text-xs font-medium uppercase tracking-wide',
      trigger: 'bg-blue-50 border-l-4 border-blue-400',
      triggerText: 'text-gray-700 text-sm',
      action: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      actionText: 'text-white font-black text-xl',
      meta: 'text-gray-500 text-sm',
      metaIcon: 'text-gray-400',
      day: 'bg-gray-100 text-gray-600',
      dayActive: 'bg-indigo-600 text-white',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wide',
      btnSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase tracking-wide'
    },
    vibrant: {
      card: 'bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl',
      header: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500',
      identity: 'text-white text-xs font-medium uppercase tracking-wider drop-shadow',
      trigger: 'bg-gradient-to-r from-blue-100 to-cyan-100 border-l-4 border-blue-500',
      triggerText: 'text-gray-800 text-sm',
      action: 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600',
      actionText: 'text-white font-black text-2xl drop-shadow-lg',
      meta: 'text-purple-700 text-sm',
      metaIcon: 'text-purple-500',
      day: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600',
      dayActive: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg',
      btnPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-2xl text-white font-bold uppercase tracking-wide',
      btnSecondary: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 font-bold uppercase tracking-wide'
    },
    dark: {
      card: 'bg-gray-900 border border-gray-700 shadow-2xl',
      header: 'bg-gray-800 border-b border-gray-700',
      identity: 'text-gray-400 text-xs font-medium uppercase tracking-wide',
      trigger: 'bg-gray-800 border-l-4 border-blue-500',
      triggerText: 'text-gray-200 text-sm',
      action: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      actionText: 'text-white font-black text-xl',
      meta: 'text-gray-400 text-sm',
      metaIcon: 'text-gray-500',
      day: 'bg-gray-800 text-gray-400',
      dayActive: 'bg-indigo-600 text-white',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wide',
      btnSecondary: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold uppercase tracking-wide'
    }
  }

  const t = themes[theme]

  const getWeekDays = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    const today = new Date(dateStr)
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    return days.map((day, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + mondayOffset + i)
      const status = habit.completions?.[d.toDateString()]
      return { day, completed: status === true, date: d.toDateString() }
    })
  }

  return (
    <div className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${t.card} ${
      isCompleted ? 'ring-4 ring-green-400 ring-opacity-50' : 
      isMissed ? 'ring-4 ring-orange-400 ring-opacity-50' : ''
    }`}>
      
      {/* Header - Identity */}
      <div className={`px-5 py-4 flex items-center justify-between ${t.header}`}>
        <span className={t.identity}>{habit.identity || 'My Identity'}</span>
        <div className="flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        
        {/* Trigger Block */}
        <div className={`rounded-xl p-4 ${t.trigger}`}>
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className={`text-xs font-bold uppercase tracking-wide ${t.triggerText} opacity-60`}>
                After
              </div>
              <div className={`${t.triggerText}`}>
                {habit.currentHabit || 'Previous habit'}
              </div>
              
              {/* Time & Location */}
              <div className="flex flex-wrap gap-3 pt-2">
                {habit.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-4 h-4 ${t.metaIcon}`} />
                    <span className={t.meta}>{habit.time}</span>
                  </div>
                )}
                {habit.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className={`w-4 h-4 ${t.metaIcon}`} />
                    <span className={t.meta}>{habit.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Block - Bold & Prominent */}
        <div className={`rounded-2xl p-6 text-center shadow-lg ${t.action}`}>
          <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-3" style={{color: 'rgba(255,255,255,0.8)'}}>
            I Will
          </div>
          <div className={`${t.actionText} leading-tight`}>
            {habit.newHabit}
          </div>
        </div>

        {/* Supporting Actions Checklist */}
        {(habit.twoMinVersion || habit.cue || habit.reward) && (
          <div className="space-y-2">
            {habit.twoMinVersion && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                <Zap className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-yellow-900 uppercase tracking-wide">2-Min Version</div>
                  <div className="text-sm text-gray-700 mt-1">{habit.twoMinVersion}</div>
                </div>
              </div>
            )}
            {habit.cue && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <Eye className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-blue-900 uppercase tracking-wide">Cue</div>
                  <div className="text-sm text-gray-700 mt-1">{habit.cue}</div>
                </div>
              </div>
            )}
            {habit.reward && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-pink-50 border border-pink-200">
                <Gift className="w-4 h-4 text-pink-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-pink-900 uppercase tracking-wide">Reward</div>
                  <div className="text-sm text-gray-700 mt-1">{habit.reward}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Day Selector - Mon to Sun */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            This Week
          </div>
          <div className="flex gap-2">
            {getWeekDays().map((d, i) => (
              <div
                key={i}
                className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  d.completed ? t.dayActive : t.day
                }`}
              >
                {d.completed ? '✓' : d.day}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={onComplete}
              className={`flex-1 py-3 rounded-xl transition-all active:scale-95 ${t.btnPrimary}`}
            >
              Complete
            </button>
            <button
              onClick={onSkip}
              className={`px-6 py-3 rounded-xl transition-all active:scale-95 ${t.btnSecondary}`}
            >
              Skip
            </button>
          </div>
        )}

        {/* Status Badge */}
        {isCompleted && (
          <div className="text-center py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-700 font-bold text-sm">✓ Completed</span>
          </div>
        )}
        {isMissed && (
          <div className="text-center py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-orange-700 font-bold text-sm">Skipped</span>
          </div>
        )}
      </div>
    </div>
  )
}
