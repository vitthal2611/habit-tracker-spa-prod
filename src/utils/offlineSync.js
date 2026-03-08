class OfflineSync {
  constructor() {
    this.queue = this.loadQueue()
    this.isOnline = navigator.onLine
    this.listeners = []
    
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  loadQueue() {
    try {
      return JSON.parse(localStorage.getItem('syncQueue') || '[]')
    } catch (error) {
      console.error('Error loading sync queue:', error)
      return []
    }
  }

  saveQueue() {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.queue))
    } catch (error) {
      console.error('Error saving sync queue:', error)
    }
  }

  addToQueue(action) {
    this.queue.push({
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      action,
      timestamp: new Date().toISOString(),
      retries: 0
    })
    this.saveQueue()
    this.notifyListeners('queued')
    
    if (this.isOnline) {
      this.processQueue()
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.notifyListeners('synced')
      return
    }

    this.notifyListeners('syncing')
    
    const processed = []
    
    for (const item of this.queue) {
      try {
        // Execute the action
        if (item.action.execute) {
          await item.action.execute()
        }
        processed.push(item.id)
      } catch (error) {
        console.error('Error processing queue item:', error)
        item.retries++
        
        // Remove after 3 failed retries
        if (item.retries >= 3) {
          processed.push(item.id)
        }
      }
    }
    
    // Remove processed items
    this.queue = this.queue.filter(item => !processed.includes(item.id))
    this.saveQueue()
    
    if (this.queue.length === 0) {
      this.notifyListeners('synced')
    }
  }

  handleOnline() {
    this.isOnline = true
    this.notifyListeners('online')
    this.processQueue()
  }

  handleOffline() {
    this.isOnline = false
    this.notifyListeners('offline')
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  notifyListeners(status) {
    this.listeners.forEach(listener => listener(status, this.queue.length))
  }

  getStatus() {
    if (!this.isOnline) return 'offline'
    if (this.queue.length > 0) return 'syncing'
    return 'synced'
  }

  getQueueLength() {
    return this.queue.length
  }

  clearQueue() {
    this.queue = []
    this.saveQueue()
    this.notifyListeners('synced')
  }
}

export const offlineSync = new OfflineSync()
