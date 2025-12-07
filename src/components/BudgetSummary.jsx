import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Download } from 'lucide-react'

export default function BudgetSummary({ budgetData, transactions = [], year = new Date().getFullYear() }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const categories = budgetData?.categories || []

  const getMonthlyData = () => {
    return months.map((month, index) => {
      const income = categories.filter(c => c.type === 'Income').reduce((sum, c) => {
        return sum + (c.monthlyBudgets?.[index] || c.monthlyBudget || 0)
      }, 0)
      
      const expense = categories.filter(c => c.type === 'Expense').reduce((sum, c) => {
        return sum + (c.monthlyBudgets?.[index] || c.monthlyBudget || 0)
      }, 0)

      const actualIncome = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getFullYear() === year && d.getMonth() === index && t.income > 0
      }).reduce((sum, t) => sum + t.income, 0)

      const actualExpense = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getFullYear() === year && d.getMonth() === index && t.expense > 0
      }).reduce((sum, t) => sum + t.expense, 0)

      return { month, income, expense, actualIncome, actualExpense, savings: income - expense }
    })
  }

  const getCategoryBreakdown = () => {
    const breakdown = {}
    categories.filter(c => c.type === 'Expense').forEach(cat => {
      const total = (cat.monthlyBudgets || []).reduce((sum, val) => sum + (val || 0), 0) || (cat.monthlyBudget || 0) * 12
      if (total > 0) breakdown[cat.name] = total
    })
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  }

  const exportToCSV = () => {
    const data = getMonthlyData()
    let csv = 'Month,Budget Income,Actual Income,Budget Expense,Actual Expense,Savings\n'
    data.forEach(d => {
      csv += `${d.month},${d.income},${d.actualIncome},${d.expense},${d.actualExpense},${d.savings}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-summary-${year}.csv`
    a.click()
  }

  const monthlyData = getMonthlyData()
  const categoryBreakdown = getCategoryBreakdown()
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0)
  const totalSavings = totalIncome - totalExpense
  const avgMonthlySavings = totalSavings / 12
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0
  const totalActualIncome = monthlyData.reduce((sum, m) => sum + m.actualIncome, 0)
  const totalActualExpense = monthlyData.reduce((sum, m) => sum + m.actualExpense, 0)
  const maxValue = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)))
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Summary {year}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Year-at-a-glance overview</p>
        </div>
        <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Download className="w-4 h-4" />Export CSV
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Total Income</div>
            <DollarSign className="w-5 h-5 opacity-75" />
          </div>
          <div className="text-2xl font-bold">₹{(totalIncome / 100000).toFixed(1)}L</div>
          <div className="text-xs opacity-75 mt-1">Budget: ₹{(totalIncome / 1000).toFixed(0)}k | Actual: ₹{(totalActualIncome / 1000).toFixed(0)}k</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Total Expense</div>
            <TrendingDown className="w-5 h-5 opacity-75" />
          </div>
          <div className="text-2xl font-bold">₹{(totalExpense / 100000).toFixed(1)}L</div>
          <div className="text-xs opacity-75 mt-1">Budget: ₹{(totalExpense / 1000).toFixed(0)}k | Actual: ₹{(totalActualExpense / 1000).toFixed(0)}k</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Total Savings</div>
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <div className="text-2xl font-bold">₹{(totalSavings / 100000).toFixed(1)}L</div>
          <div className="text-xs opacity-75 mt-1">Avg: ₹{(avgMonthlySavings / 1000).toFixed(0)}k/month</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Savings Rate</div>
            <PieChart className="w-5 h-5 opacity-75" />
          </div>
          <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
          <div className="text-xs opacity-75 mt-1">{savingsRate >= 20 ? 'Excellent!' : savingsRate >= 10 ? 'Good' : 'Needs improvement'}</div>
        </div>
      </div>

      {/* Year-at-a-Glance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Year-at-a-Glance</h3>
        </div>
        <div className="space-y-3">
          {monthlyData.map((data, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-12">{data.month}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600">₹{(data.income / 1000).toFixed(0)}k</span>
                  <span className="text-red-600">₹{(data.expense / 1000).toFixed(0)}k</span>
                  <span className={data.savings >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                    {data.savings >= 0 ? '+' : ''}₹{(data.savings / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
              <div className="flex gap-1 h-8">
                <div 
                  className="bg-green-500 rounded transition-all hover:bg-green-600"
                  style={{ width: `${(data.income / maxValue) * 100}%` }}
                  title={`Income: ₹${data.income.toLocaleString()}`}
                />
                <div 
                  className="bg-red-500 rounded transition-all hover:bg-red-600"
                  style={{ width: `${(data.expense / maxValue) * 100}%` }}
                  title={`Expense: ₹${data.expense.toLocaleString()}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Expense</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Breakdown</h3>
        </div>
        
        {categoryBreakdown.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {(() => {
                    let currentAngle = 0
                    const total = categoryBreakdown.reduce((sum, [, val]) => sum + val, 0)
                    return categoryBreakdown.map(([name, value], index) => {
                      const percentage = (value / total) * 100
                      const angle = (percentage / 100) * 360
                      const largeArc = angle > 180 ? 1 : 0
                      const x1 = 50 + 45 * Math.cos((currentAngle * Math.PI) / 180)
                      const y1 = 50 + 45 * Math.sin((currentAngle * Math.PI) / 180)
                      currentAngle += angle
                      const x2 = 50 + 45 * Math.cos((currentAngle * Math.PI) / 180)
                      const y2 = 50 + 45 * Math.sin((currentAngle * Math.PI) / 180)
                      
                      return (
                        <path
                          key={name}
                          d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[index % colors.length]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      )
                    })
                  })()}
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              {categoryBreakdown.map(([name, value], index) => {
                const percentage = (value / totalExpense) * 100
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-gray-600 dark:text-gray-400">₹{(value / 1000).toFixed(0)}k</span>
                        <span className="text-gray-500 dark:text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">Top 3 Spending Categories</div>
              <div className="space-y-1 text-sm">
                {categoryBreakdown.slice(0, 3).map(([name, value], index) => (
                  <div key={name} className="flex justify-between text-purple-700 dark:text-purple-300">
                    <span>{index + 1}. {name}</span>
                    <span className="font-medium">₹{(value / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No expense categories found. Add budget categories to see breakdown.</p>
          </div>
        )}
      </div>

      {/* Budget vs Actual */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget vs Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Income</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Budget</span>
                <span className="font-semibold text-green-600">₹{(totalIncome / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Actual</span>
                <span className="font-semibold text-green-700">₹{(totalActualIncome / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium">Variance</span>
                <span className={`font-bold ${totalActualIncome >= totalIncome ? 'text-green-600' : 'text-orange-600'}`}>
                  {totalActualIncome >= totalIncome ? '+' : ''}₹{((totalActualIncome - totalIncome) / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Expense</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Budget</span>
                <span className="font-semibold text-red-600">₹{(totalExpense / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Actual</span>
                <span className="font-semibold text-red-700">₹{(totalActualExpense / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium">Variance</span>
                <span className={`font-bold ${totalActualExpense <= totalExpense ? 'text-green-600' : 'text-red-600'}`}>
                  {totalActualExpense <= totalExpense ? '' : '+'}₹{((totalActualExpense - totalExpense) / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
