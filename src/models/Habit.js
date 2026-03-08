import { BaseEntity } from './BaseEntity'

export class Habit extends BaseEntity {
  constructor(data = {}) {
    super(data)
    this.identity = data.identity || ''
    this.currentHabit = data.currentHabit || ''
    this.newHabit = data.newHabit || ''
    this.location = data.location || ''
    this.time = data.time || ''
    this.duration = data.duration || ''
    this.stackAfter = data.stackAfter || null
    this.completions = data.completions || {}
    this.phases = data.phases || []
    this.currentPhase = data.currentPhase || 0
    this.temptationBundle = data.temptationBundle || null
    this.habitType = data.habitType || 'neutral'
    this.currentFrequency = data.currentFrequency || 'daily'
    this.awarenessScore = data.awarenessScore || 5
  }

  validate() {
    super.validate()
    if (!this.newHabit || !this.newHabit.trim()) {
      throw new Error('New habit is required')
    }
    if (this.awarenessScore < 1 || this.awarenessScore > 10) {
      throw new Error('Awareness score must be between 1 and 10')
    }
    return true
  }

  markComplete(date) {
    const dateStr = date || new Date().toISOString().split('T')[0]
    this.completions[dateStr] = true
    this.update()
  }

  markIncomplete(date) {
    const dateStr = date || new Date().toISOString().split('T')[0]
    delete this.completions[dateStr]
    this.update()
  }

  getStreak() {
    const today = new Date()
    let streak = 0
    let currentDate = new Date(today)
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (this.completions[dateStr]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  getCompletionRate(days = 30) {
    const today = new Date()
    let completed = 0
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      if (this.completions[dateStr]) completed++
    }
    
    return Math.round((completed / days) * 100)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      identity: this.identity,
      currentHabit: this.currentHabit,
      newHabit: this.newHabit,
      location: this.location,
      time: this.time,
      duration: this.duration,
      stackAfter: this.stackAfter,
      completions: this.completions,
      phases: this.phases,
      currentPhase: this.currentPhase,
      temptationBundle: this.temptationBundle,
      habitType: this.habitType,
      currentFrequency: this.currentFrequency,
      awarenessScore: this.awarenessScore
    }
  }
}
