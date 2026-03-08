import { Component } from 'react'
import { AlertCircle, Home } from 'lucide-react'

export class ModuleErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error(`${this.props.moduleName} error:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {this.props.moduleName} Error
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.props.fallbackMessage || 'This module encountered an error. Please try refreshing the page.'}
            </p>
            
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
