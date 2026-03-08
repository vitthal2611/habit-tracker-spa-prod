import { useState } from 'react'
import { TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, DollarSign, Target, AlertCircle } from 'lucide-react'

export default function EnhancedDashboard({ transactions, budgetCategories, year, modes = [] }) {
  const [viewPeriod, setViewPeriod] = useState('month') // month, quarter, year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const txnDate = new Date(t.date)
      if (viewPeriod === 'month') {
        return txnDate.getMonth() === selectedMonth && txnDate.getFullYear() === year
      } else if (viewPeriod === 'quarter') {
        const quarter = Math.floor(selectedMonth / 3)
        const txnQuarter = Math.floor(txnDate.getMonth() / 3)
        return txnQuarter === quarter && txnDate.getFullYear() === year
      }
      return txnDate.getFullYear() === year
    })
  }

  const filteredTxns = getFilteredTransactions()
  
  const totalIncome = filteredTxns.filter(t => {
    const cat = budgetCategories.find(c => c.name === t.category)
    return cat?.type === 'Income' && t.income > 0
  }).reduce((sum, t) => sum + t.income, 0)

  const totalExpense = filteredTxns.filter(t => {
    const cat = budgetCategories.find(c => c.name === t.category)
    return cat?.type === 'Expense' && t.expense > 0
  }).reduce((sum, t) => sum + t.expense, 0)

  const totalSavings = filteredTxns.filter(t => {
    const cat = budgetCategories.find(c => c.name === t.category)
    return cat?.type === 'Asset' && t.expense > 0
  }).reduce((sum, t) => sum + t.expense, 0)

  const totalLiability = filteredTxns.filter(t => {
    const cat = budgetCategories.find(c => c.name === t.category)
    return cat?.type === 'Liability' && t.expense > 0
  }).reduce((sum, t) => sum + t.expense, 0)

  const getCategoryBreakdown = () => {
    const breakdown = {}
    filteredTxns.forEach(t => {
      if (t.expense > 0) {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.expense
      }
    })
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }

  const getMonthlyTrend = () => {
    const trend = []
    for (let i = 0; i < 12; i++) {
      const monthTxns = transactions.filter(t => {
        const txnDate = new Date(t.date)
        return txnDate.getMonth() === i && txnDate.getFullYear() === year
      })
      const income = monthTxns.filter(t => t.income > 0).reduce((sum, t) => sum + t.income, 0)
      const expense = monthTxns.filter(t => t.expense > 0).reduce((sum, t) => sum + t.expense, 0)
      trend.push({ month: months[i], income, expense })
    }
    return trend
  }

  const getModeBalances = () => {
    return modes.map(mode => {
      const modeTxns = filteredTxns.filter(t => t.mode === mode)
      const income = modeTxns.reduce((sum, t) => sum + (t.income || 0), 0)
      const expense = modeTxns.reduce((sum, t) => sum + (t.expense || 0), 0)
      return { mode, balance: income - expense }
    }).filter(m => m.balance !== 0)
  }

  const getInsights = () => {
    const insights = []
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0
    
    if (savingsRate < 10) {
      insights.push({ type: 'warning', icon: '⚠️', text: `Low savings rate: ${savingsRate.toFixed(1)}%. Aim for 20%+` })
    } else if (savingsRate >= 20) {
      insights.push({ type: 'success', icon: '✅', text: `Great savings rate: ${savingsRate.toFixed(1)}%!` })
    }

    if (totalExpense > totalIncome) {
      insights.push({ type: 'danger', icon: '🚨', text: `Spending exceeds income by ₹${(totalExpense - totalIncome).toLocaleString()}` })
    }

    const topCategory = getCategoryBreakdown()[0]
    if (topCategory) {
      const percentage = (topCategory[1] / totalExpense) * 100
      insights.push({ type: 'info', icon: '📊', text: `${topCategory[0]} is ${percentage.toFixed(0)}% of expenses` })
    }

    return insights
  }

  const maxTrendValue = Math.max(...getMonthlyTrend().map(m => Math.max(m.income, m.expense)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive financial overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${viewPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Month
          </button>
          <button
            onClick={() => setViewPeriod('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${viewPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Year
          </button>
        </div>
      </div>

      {viewPeriod === 'month' && (
        <div className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-fit mx-auto">
          <button onClick={() => setSelectedMonth(selectedMonth === 0 ? 11 : selectedMonth - 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">&lt;</button>
          <span className="font-bold text-sm min-w-[60px] text-center">{months[selectedMonth]}</span>
          <button onClick={() => setSelectedMonth(selectedMonth === 11 ? 0 : selectedMonth + 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">&gt;</button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm opacity-90">Income</span>
          </div>
          <div className="text-3xl font-bold">₹{(totalIncome / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5" />
            <span className="text-sm opacity-90">Expense</span>
          </div>
          <div className="text-3xl font-bold">₹{(totalExpense / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm opacity-90">Savings</span>
          </div>
          <div className="text-3xl font-bold">₹{(totalSavings / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm opacity-90">Net</span>
          </div>
          <div className="text-3xl font-bold">₹{((totalIncome - totalExpense) / 1000).toFixed(0)}k</div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Key Insights
        </h3>
        <div className="space-y-3">
          {getInsights().map((insight, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg flex items-center gap-3 ${
                insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
              }`}
            >
              <span className="text-2xl">{insight.icon}</span>
              <span className="font-medium">{insight.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Monthly Trend
        </h3>
        <div className="flex items-end gap-2 h-48">
          {getMonthlyTrend().map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-1 items-end" style={{ height: '160px' }}>
                <div
                  className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                  style={{ height: `${(month.income / maxTrendValue) * 100}%` }}
                  title={`Income: ₹${month.income.toLocaleString()}`}
                />
                <div
                  className="flex-1 bg-red-500 rounded-t hover:bg-red-600 transition-colors"
                  style={{ height: `${(month.expense / maxTrendValue) * 100}%` }}
                  title={`Expense: ₹${month.expense.toLocaleString()}`}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{month.month}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm">Expense</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Expense Breakdown
        </h3>
        <div className="space-y-3">
          {getCategoryBreakdown().map(([category, amount]) => {
            const percentage = (amount / totalExpense) * 100
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{category}</span>
                  <span className="font-semibold">₹{amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment Mode Balances */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Payment Mode Balances
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {getModeBalances().map(({ mode, balance }) => (
            <div key={mode} className={`p-4 rounded-lg ${balance >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className="text-sm text-gray-600 dark:text-gray-400">{mode}</div>
              <div className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{balance.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
