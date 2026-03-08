import { BaseEntity } from './BaseEntity'

export class Transaction extends BaseEntity {
  constructor(data = {}) {
    super(data)
    this.type = data.type || 'expense'
    this.amount = data.amount || 0
    this.category = data.category || ''
    this.description = data.description || ''
    this.date = data.date || new Date().toISOString().split('T')[0]
    this.paymentMode = data.paymentMode || ''
    this.envelope = data.envelope || null
    this.isRecurring = data.isRecurring || false
    this.recurringPattern = data.recurringPattern || null
  }

  validate() {
    super.validate()
    if (!['expense', 'income', 'transfer'].includes(this.type)) {
      throw new Error('Type must be expense, income, or transfer')
    }
    if (!this.amount || this.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }
    if (!this.category || !this.category.trim()) {
      throw new Error('Category is required')
    }
    if (!this.date) {
      throw new Error('Date is required')
    }
    return true
  }

  getFormattedAmount() {
    return `₹${this.amount.toLocaleString()}`
  }

  getMonth() {
    return this.date.substring(0, 7)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      amount: this.amount,
      category: this.category,
      description: this.description,
      date: this.date,
      paymentMode: this.paymentMode,
      envelope: this.envelope,
      isRecurring: this.isRecurring,
      recurringPattern: this.recurringPattern
    }
  }
}
