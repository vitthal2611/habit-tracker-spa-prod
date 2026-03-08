import { CreditCard, Wallet, Building, AlertTriangle } from 'lucide-react'

export default function PaymentModeCard({ mode }) {
  const getIcon = () => {
    switch(mode.type) {
      case 'bank': return <Building className="w-6 h-6" />
      case 'cash': return <Wallet className="w-6 h-6" />
      case 'credit': return <CreditCard className="w-6 h-6" />
      default: return <Wallet className="w-6 h-6" />
    }
  }

  const getColor = () => {
    if (mode.type === 'credit') {
      const used = Math.abs(mode.balance)
      const percent = (used / mode.limit) * 100
      if (percent > 80) return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      if (percent > 50) return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }
    if (mode.balance < 0) return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    return 'border-green-500 bg-green-50 dark:bg-green-900/20'
  }

  return (
    <div className={`rounded-xl p-4 border-2 ${getColor()} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{mode.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{mode.type}</p>
          </div>
        </div>
        {mode.balance < 0 && mode.type !== 'credit' && (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        )}
      </div>

      {mode.type === 'credit' ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Used:</span>
            <span className="font-bold text-red-600">₹{Math.abs(mode.balance).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Limit:</span>
            <span className="font-semibold">₹{mode.limit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Available:</span>
            <span className="font-bold text-green-600">₹{(mode.limit - Math.abs(mode.balance)).toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${Math.min((Math.abs(mode.balance) / mode.limit) * 100, 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{mode.balance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current Balance</p>
        </div>
      )}
    </div>
  )
}
