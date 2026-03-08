export class BaseEntity {
  constructor(data = {}) {
    this.id = data.id || this.generateId()
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
    this.isDeleted = data.isDeleted || false
  }

  generateId() {
    return `${this.constructor.name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  update() {
    this.updatedAt = new Date().toISOString()
  }

  softDelete() {
    this.isDeleted = true
    this.update()
  }

  validate() {
    if (!this.id) throw new Error('ID is required')
    if (!this.createdAt) throw new Error('createdAt is required')
    return true
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isDeleted: this.isDeleted
    }
  }
}
