import { BaseEntity } from './BaseEntity'

export class Todo extends BaseEntity {
  constructor(data = {}) {
    super(data)
    this.text = data.text || ''
    this.category = data.category || 'personal'
    this.completed = data.completed || false
    this.status = data.status || 'backlog'
    this.dueDate = data.dueDate || null
    this.priority = data.priority || 'medium'
    this.timeEstimate = data.timeEstimate || null
    this.subtasks = data.subtasks || []
    this.tags = data.tags || []
    this.isRecurring = data.isRecurring || false
    this.recurringPattern = data.recurringPattern || null
    this.recurringDay = data.recurringDay || null
    this.recurringStartDate = data.recurringStartDate || null
    this.recurringEndDate = data.recurringEndDate || null
    this.delegatedTo = data.delegatedTo || null
    this.quadrant = data.quadrant || this.calculateQuadrant()
  }

  validate() {
    super.validate()
    if (!this.text || !this.text.trim()) {
      throw new Error('Task text is required')
    }
    if (!['low', 'medium', 'high'].includes(this.priority)) {
      throw new Error('Priority must be low, medium, or high')
    }
    if (!['backlog', 'in-progress', 'completed'].includes(this.status)) {
      throw new Error('Status must be backlog, in-progress, or completed')
    }
    return true
  }

  calculateQuadrant() {
    const today = new Date()
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    const isUrgent = this.dueDate && new Date(this.dueDate) <= threeDaysFromNow
    const isImportant = this.priority === 'high'
    
    if (isImportant && isUrgent) return 'Q1'
    if (isImportant && !isUrgent) return 'Q2'
    if (!isImportant && isUrgent) return 'Q3'
    return 'Q4'
  }

  markComplete() {
    this.completed = true
    this.status = 'completed'
    this.update()
  }

  markIncomplete() {
    this.completed = false
    this.status = 'backlog'
    this.update()
  }

  addSubtask(text) {
    this.subtasks.push({
      id: Date.now(),
      text,
      completed: false
    })
    this.update()
  }

  toggleSubtask(subtaskId) {
    const subtask = this.subtasks.find(st => st.id === subtaskId)
    if (subtask) {
      subtask.completed = !subtask.completed
      this.update()
    }
  }

  getProgress() {
    if (this.subtasks.length === 0) return this.completed ? 100 : 0
    const completed = this.subtasks.filter(st => st.completed).length
    return Math.round((completed / this.subtasks.length) * 100)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      text: this.text,
      category: this.category,
      completed: this.completed,
      status: this.status,
      dueDate: this.dueDate,
      priority: this.priority,
      timeEstimate: this.timeEstimate,
      subtasks: this.subtasks,
      tags: this.tags,
      isRecurring: this.isRecurring,
      recurringPattern: this.recurringPattern,
      recurringDay: this.recurringDay,
      recurringStartDate: this.recurringStartDate,
      recurringEndDate: this.recurringEndDate,
      delegatedTo: this.delegatedTo,
      quadrant: this.quadrant
    }
  }
}
