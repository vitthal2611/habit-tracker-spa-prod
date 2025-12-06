import { useState } from 'react'

export default function Dashboard({ transactions = [], budgetCategories = [], year = new Date().getFullYear() }) {
  const currentMonth = new Date().getMonth()
  const [viewMonth, setViewMonth] = useState(currentMonth)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const getMonthlySpent = (categoryName, month) => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === year && 
             transactionDate.getMonth() === month &&
             t.category === categoryName &&
             t.expense > 0
    })
    return monthTransactions.reduce((sum, t) => sum + (t.expense || 0), 0)
  }
  
  const getBudgetUtilization = (categoryName, month) => {
    const spent = getMonthlySpent(categoryName, month)
    const budget = budgetCategories.find(c => c.name === categoryName)
    const budgetAmount = budget ? (budget.monthlyBudgets && budget.monthlyBudgets[month] !== undefined ? budget.monthlyBudgets[month] : (budget.monthlyBudget || 0)) : 0
    return budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Budget vs spending analysis</p>
        </div>
      </div>

      {/* Budget vs Spending */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Budget vs Spending</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{months[viewMonth]} {year} performance</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewMonth(viewMonth === 0 ? 11 : viewMonth - 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-medium text-gray-900 dark:text-white min-w-[80px] text-center">{months[viewMonth]}</span>
              <button onClick={() => setViewMonth(viewMonth === 11 ? 0 : viewMonth + 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {budgetCategories.sort((a, b) => {
              const utilizationA = getBudgetUtilization(a.name, viewMonth)
              const utilizationB = getBudgetUtilization(b.name, viewMonth)
              return utilizationB - utilizationA
            }).map((cat, index) => {
              const budget = (cat.monthlyBudgets && cat.monthlyBudgets[viewMonth] !== undefined) ? cat.monthlyBudgets[viewMonth] : (cat.monthlyBudget || 0)
              const spent = getMonthlySpent(cat.name, viewMonth)
              const remaining = budget - spent
              const utilization = getBudgetUtilization(cat.name, viewMonth)
              
              return (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cat.type === 'Asset' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        cat.type === 'Liability' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                        cat.type === 'Income' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {cat.type}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Budget Utilization</div>
                      <div className={`text-lg font-bold ${
                        utilization > 100 ? 'text-red-600' : utilization > 80 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {utilization.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">BUDGET</div>
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-300">₹{budget.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">SPENT</div>
                      <div className="text-lg font-bold text-red-700 dark:text-red-300">₹{spent.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">REMAINING</div>
                      <div className={`text-lg font-bold ${remaining >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        ₹{Math.abs(remaining).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cash Flow Quadrant Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cash Flow Quadrant Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Based on Robert Kiyosaki's Cash Flow Quadrant principles</p>
        </div>
        <div className="p-6">
          {/* Income Statement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">💰 INCOME</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Salary/Wages (E-Quadrant)</span>
                  <span className="font-semibold text-green-600">₹{budgetCategories.filter(c => c.type === 'Income').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                      return sum + c.monthlyBudgets[viewMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Passive Income (I-Quadrant)</span>
                  <span className="font-semibold text-green-600">₹{budgetCategories.filter(c => c.type === 'Asset').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                      return sum + c.monthlyBudgets[viewMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-green-200 dark:border-green-700 pt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Income</span>
                    <span className="text-green-600">₹{transactions.filter(t => {
                      const transactionDate = new Date(t.date)
                      return transactionDate.getFullYear() === year && 
                             transactionDate.getMonth() === viewMonth &&
                             t.income > 0
                    }).reduce((sum, t) => sum + (t.income || 0), 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-4">💸 EXPENSES</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Living Expenses</span>
                  <span className="font-semibold text-red-600">₹{budgetCategories.filter(c => c.type === 'Expense').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                      return sum + c.monthlyBudgets[viewMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Liabilities (Debt Payments)</span>
                  <span className="font-semibold text-red-600">₹{budgetCategories.filter(c => c.type === 'Liability').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                      return sum + c.monthlyBudgets[viewMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-red-200 dark:border-red-700 pt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Expenses</span>
                    <span className="text-red-600">₹{(budgetCategories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                      if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                        return sum + c.monthlyBudgets[viewMonth]
                      }
                      return sum + (c.monthlyBudget || 0)
                    }, 0)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Flow Status */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">💰 Net Cash Flow</h3>
              <div className={`text-4xl font-bold mb-2 ${
                (transactions.filter(t => {
                  const transactionDate = new Date(t.date)
                  return transactionDate.getFullYear() === year && 
                         transactionDate.getMonth() === viewMonth &&
                         t.income > 0
                }).reduce((sum, t) => sum + (t.income || 0), 0) - budgetCategories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                  if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                    return sum + c.monthlyBudgets[viewMonth]
                  }
                  return sum + (c.monthlyBudget || 0)
                }, 0)) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{Math.abs(transactions.filter(t => {
                  const transactionDate = new Date(t.date)
                  return transactionDate.getFullYear() === year && 
                         transactionDate.getMonth() === viewMonth &&
                         t.income > 0
                }).reduce((sum, t) => sum + (t.income || 0), 0) - budgetCategories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                  if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                    return sum + c.monthlyBudgets[viewMonth]
                  }
                  return sum + (c.monthlyBudget || 0)
                }, 0)).toLocaleString('en-IN')}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(transactions.filter(t => {
                  const transactionDate = new Date(t.date)
                  return transactionDate.getFullYear() === year && 
                         transactionDate.getMonth() === viewMonth &&
                         t.income > 0
                }).reduce((sum, t) => sum + (t.income || 0), 0) - budgetCategories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                  if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                    return sum + c.monthlyBudgets[viewMonth]
                  }
                  return sum + (c.monthlyBudget || 0)
                }, 0)) >= 0 ? 'Positive Cash Flow - Money flowing IN' : 'Negative Cash Flow - Money flowing OUT'}
              </p>
            </div>
          </div>

          {/* Quadrant Recommendations */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">🎯 Cash Flow Quadrant Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <span className="text-2xl">👨💼</span>
                  <div>
                    <div className="font-semibold text-yellow-800 dark:text-yellow-200">Employee (E) Quadrant</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">You work for money - Trading time for money</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <span className="text-2xl">💎</span>
                  <div>
                    <div className="font-semibold text-green-800 dark:text-green-200">Investor (I) Quadrant</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Money works for you - Passive income goal</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {(() => {
                  const passiveIncome = budgetCategories.filter(c => c.type === 'Asset').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                      return sum + c.monthlyBudgets[viewMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0)
                  const totalIncome = transactions.filter(t => {
                    const transactionDate = new Date(t.date)
                    return transactionDate.getFullYear() === year && 
                           transactionDate.getMonth() === viewMonth &&
                           t.income > 0
                  }).reduce((sum, t) => sum + (t.income || 0), 0)
                  const passiveRatio = totalIncome > 0 ? (passiveIncome / totalIncome) * 100 : 0
                  const recommendations = []
                  
                  if (passiveRatio < 10) recommendations.push({ text: 'Focus on building passive income streams (I-Quadrant)', type: 'warning', icon: '📈' })
                  if (passiveRatio >= 10 && passiveRatio < 25) recommendations.push({ text: 'Good start! Increase passive income to 25%+', type: 'info', icon: '🎯' })
                  if (passiveRatio >= 25) recommendations.push({ text: 'Excellent! You\'re building financial freedom', type: 'success', icon: '🏆' })
                  
                  const netCashFlow = totalIncome - budgetCategories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) {
                      return sum + c.monthlyBudgets[viewMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0)
                  
                  if (netCashFlow <= 0) recommendations.push({ text: 'Reduce expenses or increase income immediately', type: 'danger', icon: '🚨' })
                  if (netCashFlow > 0) recommendations.push({ text: 'Invest surplus in income-generating assets', type: 'success', icon: '💰' })
                  
                  return recommendations.map((rec, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${
                      rec.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      rec.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                      rec.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}>
                      <span>{rec.icon}</span>
                      <span className="font-medium text-xs">{rec.text}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}