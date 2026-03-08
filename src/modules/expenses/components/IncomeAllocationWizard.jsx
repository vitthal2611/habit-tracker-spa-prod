import { useState } from 'react'
import { ArrowRight, Check, AlertCircle } from 'lucide-react'

export default function IncomeAllocationWizard({ month, onComplete, onClose }) {
  const [step, setStep] = useState(1)
  const [income, setIncome] = useState('')
  const [envelopes, setEnvelopes] = useState({
    essentials: { rent: 0, utilities: 0, groceries: 0 },
    savings: { emergency: 0, investment: 0 },
    discretionary: { entertainment: 0, dining: 0, shopping: 0 }
  })

  const totalAllocated = Object.values(envelopes).reduce((sum, category) => 
    sum + Object.values(category).reduce((s, v) => s + v, 0), 0
  )
  const unallocated = parseFloat(income) - totalAllocated

  const updateEnvelope = (category, key, value) => {
    setEnvelopes({
      ...envelopes,
      [category]: { ...envelopes[category], [key]: parseFloat(value) || 0 }
    })
  }

  const handleComplete = () => {
    const allEnvelopes = []
    Object.entries(envelopes).forEach(([category, items]) => {
      Object.entries(items).forEach(([name, allocated]) => {
        if (allocated > 0) {
          allEnvelopes.push({
            id: `env_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            allocated,
            spent: 0,
            remaining: allocated,
            category
          })
        }
      })
    })
    
    onComplete({
      month,
      income: parseFloat(income),
      allocated: totalAllocated,
      unallocated,
      envelopes: allEnvelopes
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Income Allocation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Step {step} of 5</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Enter Income */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter Monthly Income</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">How much income do you expect this month?</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">₹</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="50000"
                autoFocus
              />
            </div>
            <button
              onClick={() => income && setStep(2)}
              disabled={!income}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Essentials */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Allocate to Essentials</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Rent, utilities, groceries, etc.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Rent</label>
                <input
                  type="number"
                  value={envelopes.essentials.rent || ''}
                  onChange={(e) => updateEnvelope('essentials', 'rent', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Utilities</label>
                <input
                  type="number"
                  value={envelopes.essentials.utilities || ''}
                  onChange={(e) => updateEnvelope('essentials', 'utilities', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="3000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Groceries</label>
                <input
                  type="number"
                  value={envelopes.essentials.groceries || ''}
                  onChange={(e) => updateEnvelope('essentials', 'groceries', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="8000"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2">
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Savings */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Allocate to Savings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Emergency fund, investments, etc.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Emergency Fund</label>
                <input
                  type="number"
                  value={envelopes.savings.emergency || ''}
                  onChange={(e) => updateEnvelope('savings', 'emergency', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Investments</label>
                <input
                  type="number"
                  value={envelopes.savings.investment || ''}
                  onChange={(e) => updateEnvelope('savings', 'investment', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Back</button>
              <button onClick={() => setStep(4)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2">
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Discretionary */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Allocate to Discretionary</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Entertainment, dining, shopping, etc.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Entertainment</label>
                <input
                  type="number"
                  value={envelopes.discretionary.entertainment || ''}
                  onChange={(e) => updateEnvelope('discretionary', 'entertainment', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="3000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dining Out</label>
                <input
                  type="number"
                  value={envelopes.discretionary.dining || ''}
                  onChange={(e) => updateEnvelope('discretionary', 'dining', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="4000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shopping</label>
                <input
                  type="number"
                  value={envelopes.discretionary.shopping || ''}
                  onChange={(e) => updateEnvelope('discretionary', 'shopping', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="2000"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Back</button>
              <button onClick={() => setStep(5)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2">
                Review <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Allocation</h3>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="font-medium">Total Income:</span>
                <span className="font-bold">₹{parseFloat(income).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-medium">Total Allocated:</span>
                <span className="font-bold text-green-600">₹{totalAllocated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl border-t-2 border-gray-300 dark:border-gray-600 pt-3">
                <span className="font-bold">Unallocated:</span>
                <span className={`font-bold ${unallocated === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  ₹{unallocated.toLocaleString()}
                </span>
              </div>
            </div>

            {unallocated !== 0 && (
              <div className="bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800 dark:text-orange-300">
                    {unallocated > 0 ? 'Unallocated Income' : 'Over-allocated!'}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    {unallocated > 0 
                      ? 'You have unallocated income. Consider allocating it to savings or other envelopes.'
                      : 'You have allocated more than your income. Please adjust your allocations.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep(4)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Back</button>
              <button 
                onClick={handleComplete}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Complete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
