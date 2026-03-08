import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

const BUDGET_CATEGORIES = {
  Income: [{ name: 'Salary', amount: 0 }],
  Investment: [
    { name: 'Wife SIP', amount: 0 },
    { name: 'SSY', amount: 0 },
    { name: 'Baby SIP', amount: 0 },
    { name: 'My SIP', amount: 0 }
  ],
  Liability: [{ name: 'EMI', amount: 0 }],
  Expense: [
    { name: 'DMART & Oil', amount: 0 },
    { name: 'Milk', amount: 0 },
    { name: 'Gas', amount: 0 },
    { name: 'Water', amount: 0 },
    { name: 'Electricity', amount: 0 },
    { name: 'Bai', amount: 0 },
    { name: 'Petrol', amount: 0 },
    { name: 'Baby-School', amount: 0 },
    { name: 'School', amount: 0 },
    { name: 'Vegetable', amount: 0 },
    { name: 'Med-Amruta', amount: 0 },
    { name: 'Med-Insurance', amount: 0 },
    { name: 'Vacation', amount: 0 }
  ]
}

export default function BudgetFlow({ budgetData, allBudgets = [], onSave }) {
  const [step, setStep] = useState(0)
  const [income, setIncome] = useState(0)
  const [allocations, setAllocations] = useState({})
  const [balance, setBalance] = useState(0)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const allCategories = ['Investment', 'Liability', 'Expense']
  const steps = ['Income', ...allCategories]

  useEffect(() => {
    const monthBudget = allBudgets.find(b => b.month === selectedMonth)
    if (monthBudget) {
      setIncome(monthBudget.income || 0)
      setAllocations(monthBudget.allocations || {})
      setStep(monthBudget.step || 0)
    } else {
      setIncome(0)
      setAllocations({})
      setStep(0)
    }
  }, [selectedMonth, allBudgets])

  useEffect(() => {
    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0)
    setBalance(income - totalAllocated)
  }, [income, allocations])

  const handleIncomeSubmit = () => {
    if (income > 0) {
      setStep(1)
      setCurrentCategory('Investment')
      setCurrentIndex(0)
    }
  }

  const handleAllocation = (category, amount) => {
    const key = `${category}-${currentIndex}`
    setAllocations(prev => ({ ...prev, [key]: amount }))
  }

  const handleNext = () => {
    const categoryItems = BUDGET_CATEGORIES[currentCategory]
    if (currentIndex < categoryItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      const currentCategoryIndex = allCategories.indexOf(currentCategory)
      if (currentCategoryIndex < allCategories.length - 1) {
        setCurrentCategory(allCategories[currentCategoryIndex + 1])
        setCurrentIndex(0)
        setStep(step + 1)
      } else {
        setStep(steps.length)
      }
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleSave = () => {
    onSave({ income, allocations, step, month: selectedMonth, completedAt: new Date().toISOString() })
  }

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = -2; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    return options
  }

  const getTotalByType = (type) => {
    return Object.entries(allocations)
      .filter(([key]) => key.startsWith(type))
      .reduce((sum, [, val]) => sum + (val || 0), 0)
  }

  const getProgressPercent = () => {
    const totalSteps = steps.length + BUDGET_CATEGORIES.Investment.length + BUDGET_CATEGORIES.Liability.length + BUDGET_CATEGORIES.Expense.length
    let completed = 0
    if (step > 0) completed++
    completed += Object.keys(allocations).length
    return Math.round((completed / totalSteps) * 100)
  }

  if (step === 0) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Let's Start with Income</h2>
            <p className="text-gray-600 dark:text-gray-400">Enter your monthly income to begin budget allocation</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 mb-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {getMonthOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Income (₹)</label>
            <input
              type="number"
              value={income || ''}
              onChange={(e) => setIncome(Number(e.target.value))}
              placeholder="Enter your salary"
              className="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleIncomeSubmit}
              disabled={!income || income <= 0}
              className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === steps.length) {
    const totalInvestment = getTotalByType('Investment')
    const totalLiability = getTotalByType('Liability')
    const totalExpense = getTotalByType('Expense')

    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Summary</h2>
            <p className="text-gray-600 dark:text-gray-400">{new Date(selectedMonth + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{income.toLocaleString()}</p>
            </div>

            <div className={`rounded-xl p-6 border ${balance >= 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className={`w-6 h-6 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining Balance</span>
              </div>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>₹{balance.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Investments</h3>
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{totalInvestment.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BUDGET_CATEGORIES.Investment.map((item, idx) => {
                  const amount = allocations[`Investment-${idx}`] || 0
                  return amount > 0 && (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.name}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">₹{amount.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Liabilities</h3>
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{totalLiability.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BUDGET_CATEGORIES.Liability.map((item, idx) => {
                  const amount = allocations[`Liability-${idx}`] || 0
                  return amount > 0 && (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.name}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">₹{amount.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expenses</h3>
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">₹{totalExpense.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BUDGET_CATEGORIES.Expense.map((item, idx) => {
                  const amount = allocations[`Expense-${idx}`] || 0
                  return amount > 0 && (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.name}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">₹{amount.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => { setStep(0); setAllocations({}); }}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Save Budget
            </button>
          </div>
        </div>
      </div>
    )
  }

  const categoryItems = BUDGET_CATEGORIES[currentCategory]
  const currentItem = categoryItems[currentIndex]
  const currentKey = `${currentCategory}-${currentIndex}`
  const currentAmount = allocations[currentKey] || 0

  const getIcon = () => {
    if (currentCategory === 'Investment') return <TrendingUp className="w-8 h-8 text-white" />
    if (currentCategory === 'Liability') return <TrendingDown className="w-8 h-8 text-white" />
    return <DollarSign className="w-8 h-8 text-white" />
  }

  const getColor = () => {
    if (currentCategory === 'Investment') return 'purple'
    if (currentCategory === 'Liability') return 'orange'
    return 'red'
  }

  const color = getColor()

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{getProgressPercent()}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${getProgressPercent()}%` }}></div>
        </div>
      </div>

      <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-800/20 rounded-2xl p-8 border border-${color}-200 dark:border-${color}-800`}>
        <div className="text-center mb-8">
          <div className={`w-16 h-16 bg-${color}-500 rounded-full flex items-center justify-center mx-auto mb-4`}>
            {getIcon()}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentItem.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">Allocate budget for {currentCategory.toLowerCase()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</span>
            <span className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ₹{balance.toLocaleString()}
            </span>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Amount (₹)</label>
          <input
            type="number"
            value={currentAmount || ''}
            onChange={(e) => handleAllocation(currentCategory, Number(e.target.value))}
            placeholder="0"
            className="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className={`flex-1 px-6 py-3 bg-${color}-600 hover:bg-${color}-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Investment</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">₹{getTotalByType('Investment').toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Liability</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">₹{getTotalByType('Liability').toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expense</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">₹{getTotalByType('Expense').toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
