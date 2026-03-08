import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }

  return (
    <div className={`fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 ${colors[type]} text-white rounded-xl shadow-2xl animate-slide-up`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {icons[type]}
        <span className="flex-1 font-semibold text-sm">{message}</span>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
