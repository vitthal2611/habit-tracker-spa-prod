import { useState } from 'react'
import { DollarSign } from 'lucide-react'

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
]

export default function CurrencySelector({ selected, onSelect }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const current = CURRENCIES.find(c => c.code === selected) || CURRENCIES[0]

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600">
        <DollarSign className="w-5 h-5" />
        <span className="font-semibold">{current.symbol} {current.code}</span>
      </button>
      {showDropdown && (
        <div className="absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          {CURRENCIES.map(currency => (
            <button key={currency.code} onClick={() => { onSelect(currency.code); setShowDropdown(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
              <span className="text-xl">{currency.symbol}</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{currency.code}</div>
                <div className="text-xs text-gray-500">{currency.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
