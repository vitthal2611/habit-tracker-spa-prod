import { Component } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft, Mail } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({ error, errorInfo })
    
    // Haptic feedback on error
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
    
    // Log to localStorage for debugging
    try {
      const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]')
      errorLog.push({
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        module: this.props.moduleName || 'App'
      })
      localStorage.setItem('errorLog', JSON.stringify(errorLog.slice(-10)))
    } catch (e) {
      console.error('Failed to log error:', e)
    }
  }

  handleReload = () => {
    // Preserve user data before reload
    try {
      const preserveKeys = ['habits', 'todos', 'transactions', 'budgets', 'settings']
      const preserved = {}
      preserveKeys.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) preserved[key] = data
      })
      sessionStorage.setItem('preservedData', JSON.stringify(preserved))
    } catch (e) {
      console.error('Failed to preserve data:', e)
    }
    window.location.reload()
  }

  handleGoBack = () => {
    if (this.props.onReset) {
      this.props.onReset()
    }
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (window.history.length > 1) {
      window.history.back()
    }
  }

  handleReportIssue = () => {
    const errorDetails = `
Error: ${this.state.error?.toString() || 'Unknown error'}
Module: ${this.props.moduleName || 'App'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}

Stack Trace:
${this.state.error?.stack || 'No stack trace'}
    `.trim()
    
    const mailtoLink = `mailto:support@example.com?subject=App Error Report&body=${encodeURIComponent(errorDetails)}`
    window.location.href = mailtoLink
  }

  render() {
    if (this.state.hasError) {
      const isOffline = !navigator.onLine
      
      return (
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 pt-safe pb-safe">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* Large Error Icon */}
            <div className="flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            
            {/* Simple Error Message */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {isOffline ? 'You\'re Offline' : 'Something Went Wrong'}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                {isOffline 
                  ? 'Please check your internet connection and try again.'
                  : 'Don\'t worry, your data is safe. Try reloading the app.'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full min-h-[52px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-base hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reload App
              </button>
              
              <button
                onClick={this.handleGoBack}
                className="w-full min-h-[52px] px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-base hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
              
              {!isOffline && (
                <button
                  onClick={this.handleReportIssue}
                  className="w-full min-h-[52px] px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-base hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Report Issue
                </button>
              )}
            </div>
            
            {/* Optional Error Details */}
            {this.props.showDetails && this.state.error && (
              <details className="text-left">
                <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Technical Details
                </summary>
                <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-h-32 overflow-auto">
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
