import { useState } from 'react'

export default function Dashboard({ transactions = [], budgetCategories = [], year = new Date().getFullYear() }) {
  const currentMonth = new Date().getMonth()
  const [viewMonth, setViewMonth] = useState(currentMonth)
  const [viewAllTime, setViewAllTime] = useState(false)
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

  const getAllTimeSpent = (categoryName) => {
    return transactions.filter(t => t.category === categoryName && t.expense > 0)
      .reduce((sum, t) => sum + (t.expense || 0), 0)
  }
  
  const getBudgetUtilization = (categoryName, month) => {
    const spent = getMonthlySpent(categoryName, month)
    const budget = budgetCategories.find(c => c.name === categoryName)
    const budgetAmount = budget ? (budget.monthlyBudgets && budget.monthlyBudgets[month] !== undefined ? budget.monthlyBudgets[month] : (budget.monthlyBudget || 0)) : 0
    return budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
  }

  const expenseCategories = budgetCategories.filter(c => c.type === 'Expense')
  const totalBudget = viewAllTime 
    ? expenseCategories.reduce((sum, c) => sum + ((c.monthlyBudgets || []).reduce((s, v) => s + (v || 0), 0) || (c.monthlyBudget || 0) * 12), 0)
    : expenseCategories.reduce((sum, c) => sum + ((c.monthlyBudgets && c.monthlyBudgets[viewMonth] !== undefined) ? c.monthlyBudgets[viewMonth] : (c.monthlyBudget || 0)), 0)
  const totalActual = viewAllTime
    ? expenseCategories.reduce((sum, c) => sum + getAllTimeSpent(c.name), 0)
    : expenseCategories.reduce((sum, c) => sum + getMonthlySpent(c.name, viewMonth), 0)
  const totalVariance = totalActual - totalBudget

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Budget vs spending analysis</p>
        </div>
      </div>

      {/* Budget vs Actual Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Budget vs Actual</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{viewAllTime ? 'All Time' : `${months[viewMonth]} ${year}`} comparison</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewAllTime(false)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!viewAllTime ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setViewAllTime(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewAllTime ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                All Time
              </button>
              {!viewAllTime && (
                <div className="flex items-center gap-1 ml-2">
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
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Variance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">%</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenseCategories.map((cat, index) => {
                const budget = viewAllTime
                  ? ((cat.monthlyBudgets || []).reduce((s, v) => s + (v || 0), 0) || (cat.monthlyBudget || 0) * 12)
                  : ((cat.monthlyBudgets && cat.monthlyBudgets[viewMonth] !== undefined) ? cat.monthlyBudgets[viewMonth] : (cat.monthlyBudget || 0))
                const actual = viewAllTime ? getAllTimeSpent(cat.name) : getMonthlySpent(cat.name, viewMonth)
                const variance = actual - budget
                const percentage = budget > 0 ? (actual / budget) * 100 : 0
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{cat.name}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">₹{budget.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">₹{actual.toLocaleString('en-IN')}</td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {variance > 0 ? '+' : ''}₹{variance.toLocaleString('en-IN')}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${percentage > 100 ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {percentage.toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        percentage > 100 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        percentage > 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {percentage > 100 ? '🚨 Over' : percentage > 80 ? '⚠️ High' : '✅ Good'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">TOTAL</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">₹{totalBudget.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">₹{totalActual.toLocaleString('en-IN')}</td>
                <td className={`px-6 py-4 text-sm text-right ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalVariance > 0 ? '+' : ''}₹{totalVariance.toLocaleString('en-IN')}
                </td>
                <td className={`px-6 py-4 text-sm text-right ${totalBudget > 0 && (totalActual / totalBudget) * 100 > 100 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(0) : 0}%
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </div>
  )
}