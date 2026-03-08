import { useState } from 'react'
import { Plus, Trash2, CreditCard, Wallet, Building } from 'lucide-react'

export default function PaymentModeManager({ modes, onSave, onClose }) {
  const [paymentModes, setPaymentModes] = useState(modes || [])

  const addMode = () => {
    setPaymentModes([...paymentModes, { 
      id: `pm_${Date.now()}`, 
      name: '', 
      balance: 0, 
      type: 'bank' 
    }])
  }

  const updateMode = (id, field, value) => {
    setPaymentModes(paymentModes.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const deleteMode = (id) => {
    setPaymentModes(paymentModes.filter(m => m.id !== id))
  }

  const getIcon = (type) => {
    switch(type) {
      case 'bank': return <Building className="w-5 h-5" />
      case 'cash': return <Wallet className="w-5 h-5" />
      case 'credit': return <CreditCard className="w-5 h-5" />
      default: return <Wallet className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Modes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        <div className="space-y-3 mb-4">
          {paymentModes.map(mode => (
            <div key={mode.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={mode.name}
                    onChange={(e) => updateMode(mode.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                    placeholder="HDFC Bank"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Type</label>
                  <select
                    value={mode.type}
                    onChange={(e) => updateMode(mode.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash</option>
                    <option value="credit">Credit Card</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Current Balance</label>
                  <input
                    type="number"
                    value={mode.balance}
                    onChange={(e) => updateMode(mode.id, 'balance', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                    placeholder="25000"
                  />
                </div>
                {mode.type === 'credit' && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Credit Limit</label>
                    <input
                      type="number"
                      value={mode.limit || ''}
                      onChange={(e) => updateMode(mode.id, 'limit', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                      placeholder="50000"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteMode(mode.id)}
                className="mt-3 w-full px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addMode}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="w-5 h-5" /> Add Payment Mode
        </button>

        <button
          onClick={() => onSave(paymentModes)}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
