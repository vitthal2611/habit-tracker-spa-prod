import { TrendingDown, AlertTriangle } from 'lucide-react'

export default function EnvelopeCard({ envelope }) {
  const percentUsed = (envelope.spent / envelope.allocated) * 100
  const isOverBudget = envelope.spent > envelope.allocated

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 ${
      isOverBudget ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
    } shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">{envelope.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{envelope.category}</p>
        </div>
        {isOverBudget && (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Allocated:</span>
          <span className="font-semibold">₹{envelope.allocated.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Spent:</span>
          <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-orange-600'}`}>
            ₹{envelope.spent.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
          <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            ₹{envelope.remaining.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isOverBudget 
                  ? 'bg-red-500' 
                  : percentUsed > 80 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1 font-medium text-gray-600 dark:text-gray-400">
            {percentUsed.toFixed(0)}% used
          </p>
        </div>
      </div>
    </div>
  )
}
