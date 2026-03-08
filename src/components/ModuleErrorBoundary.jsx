import { Component } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export class ModuleErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error(`${this.props.moduleName} error:`, error, errorInfo)
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
    
    // Log module-specific error
    try {
      const errorLog = JSON.parse(localStorage.getItem('moduleErrors') || '[]')
      errorLog.push({
        timestamp: new Date().toISOString(),
        module: this.props.moduleName,
        error: error.toString(),
        retryCount: this.state.retryCount
      })
      localStorage.setItem('moduleErrors', JSON.stringify(errorLog.slice(-20)))
    } catch (e) {
      console.error('Failed to log module error:', e)
    }
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1
    const backoffDelay = Math.min(1000 * Math.pow(2, newRetryCount), 10000)
    
    this.setState({ retryCount: newRetryCount })
    
    setTimeout(() => {
      this.setState({ hasError: false })
    }, backoffDelay)
  }

  handleGoHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome()
    }
    this.setState({ hasError: false, retryCount: 0 })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6 animate-fade-in">
          <div className="text-center max-w-md w-full space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto">
              <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {this.props.moduleName} Error
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400">
                {this.props.fallbackMessage || 'This module encountered an error. Other modules are still working.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 min-h-[48px] px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Retry {this.state.retryCount > 0 && `(${this.state.retryCount})`}
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 min-h-[48px] px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            </div>
            
            {this.state.retryCount > 2 && (
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Multiple retry attempts detected. Consider reloading the entire app.
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
