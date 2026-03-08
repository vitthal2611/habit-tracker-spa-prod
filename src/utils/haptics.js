class Haptics {
  constructor() {
    this.enabled = true
    this.isSupported = 'vibrate' in navigator
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  vibrate(pattern) {
    if (!this.enabled || !this.isSupported) return
    
    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }

  // Light tap - for button presses, toggles
  light() {
    this.vibrate(10)
  }

  // Medium tap - for selections, swipes
  medium() {
    this.vibrate(20)
  }

  // Heavy tap - for important actions
  heavy() {
    this.vibrate(50)
  }

  // Success pattern - for completed actions
  success() {
    this.vibrate([10, 50, 10])
  }

  // Error pattern - for failed actions
  error() {
    this.vibrate([50, 100, 50])
  }

  // Warning pattern - for alerts
  warning() {
    this.vibrate([30, 50, 30])
  }

  // Selection pattern - for picking items
  selection() {
    this.vibrate(15)
  }

  // Impact pattern - for drag and drop
  impact() {
    this.vibrate(25)
  }

  // Notification pattern - for alerts
  notification() {
    this.vibrate([10, 50, 10, 50, 10])
  }
}

export const haptics = new Haptics()
