import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Download, Target, Calendar, Repeat, FileText } from 'lucide-react'
import jsPDF from 'jspdf'

const CATEGORY_ICONS = {
  'EMI': '🏠', 'DMART & Oil': '🛒', 'Milk': '🥛', 'Gas': '🔥', 'Water': '💧',
  'Electricity': '⚡', 'Bai': '👩', 'Petrol': '⛽', 'baby-School': '🎒', 'School': '📚',
  'Vegetable': '🥬', 'Med-Amruta': '💊', 'Med-Insurance': '🏥', 'Vacation': '✈️',
  'Wife SIP': '💰', 'SSY': '👧', 'BabySIP': '👶', 'My SIP': '📈', 'Salary': '💵'
}

export default function EnhancedExpenseManager({ transactions, onAddTransaction, budgets, savingsGoals = [], onSaveGoals, recurringTemplates = [], onSaveTemplates }) {
  const [budgetMonth, setBudgetMonth] = useState(new Date(2025, 10, 25))
  const [showSavingsGoals, setShowSavingsGoals] = useState(false)
  const [showRecurring, setShowRecurring] = useState(false)
  const [showInsights, setShowInsights] = useState(false)

  const currentMonthKey = budgetMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })
  const currentBudget = budgets?.[currentMonthKey] || []

  const getMonthlyData = () => {
    const year = budgetMonth.getFullYear()
    const month = budgetMonth.getMonth()
    const startDate = new Date(year, month, 25)
    const endDate = new Date(year, month + 1, 24)
    
    const monthTransactions = transactions.filter(t => {
      const txnDate = new Date(t.date)
      return txnDate >= startDate && txnDate <= endDate
    })
    
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    
    return { income, expense, balance: income - expense, transactions: monthTransactions }
  }

  const monthlyData = useMemo(() => getMonthlyData(), [transactions, budgetMonth])

  const categorySpending = useMemo(() => {
    return currentBudget.map(cat => {
      const spent = monthlyData.transactions
        .filter(t => t.category === cat.name && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      const budget = cat.budget || 0
      return { ...cat, spent, budget, remaining: budget - spent, percentage: budget > 0 ? (spent / budget) * 100 : 0 }
    }).sort((a, b) => b.spent - a.spent)
  }, [currentBudget, monthlyData.transactions])

  const trends = useMemo(() => {
    const last3Months = []
    for (let i = 2; i >= 0; i--) {
      const date = new Date(budgetMonth)
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      const monthTxns = transactions.filter(t => {
        const txnDate = new Date(t.date)
        return txnDate.getMonth() === date.getMonth() && txnDate.getFullYear() === date.getFullYear()
      })
      const expense = monthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      last3Months.push({ month: monthKey, expense })
    }
    return last3Months
  }, [transactions, budgetMonth])

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Category', 'Description', 'Amount', 'Type', 'Mode'],
      ...monthlyData.transactions.map(t => [
        t.date, t.category, t.description, t.amount, t.type, t.mode
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${currentMonthKey}.csv`
    a.click()
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`Expense Report - ${currentMonthKey}`, 20, 20)
    
    doc.setFontSize(12)
    doc.text(`Income: ₹${monthlyData.income.toLocaleString()}`, 20, 40)
    doc.text(`Expense: ₹${monthlyData.expense.toLocaleString()}`, 20, 50)
    doc.text(`Balance: ₹${monthlyData.balance.toLocaleString()}`, 20, 60)
    
    doc.text('Category Breakdown:', 20, 80)
    let y = 90
    categorySpending.slice(0, 10).forEach(cat => {
      doc.text(`${cat.name}: ₹${cat.spent.toLocaleString()} / ₹${cat.budget.toLocaleString()}`, 20, y)
      y += 10
    })
    
    doc.save(`expense-report-${currentMonthKey}.pdf`)
  }

  const applyRecurringTemplate = (template) => {
    template.transactions.forEach(t => {
      onAddTransaction({
        ...t,
        date: new Date().toISOString().split('T')[0],
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      })
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enhanced Expense Manager</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Complete financial tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />CSV
          </button>
          <button onClick={exportToPDF} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />PDF
          </button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-fit mx-auto">
        <button onClick={() => setBudgetMonth(new Date(budgetMonth.setMonth(budgetMonth.getMonth() - 1)))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">&lt;</button>
        <span className="font-bold text-sm min-w-[80px] text-center">{currentMonthKey}</span>
        <button onClick={() => setBudgetMonth(new Date(budgetMonth.setMonth(budgetMonth.getMonth() + 1)))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">&gt;</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Income</span>
          </div>
          <div className="text-2xl font-bold text-green-700">₹{monthlyData.income.toLocaleString()}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-600">Expense</span>
          </div>
          <div className="text-2xl font-bold text-red-700">₹{monthlyData.expense.toLocaleString()}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Balance</span>
          </div>
          <div className={`text-2xl font-bold ${monthlyData.balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            ₹{monthlyData.balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Budget vs Actual Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <h3 className="text-lg font-bold mb-4">Budget vs Actual</h3>
        <div className="space-y-3">
          {categorySpending.slice(0, 8).map(cat => (
            <div key={cat.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <span className="text-xl">{CATEGORY_ICONS[cat.name] || '📊'}</span>
                  {cat.name}
                </span>
                <span className={cat.percentage > 100 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                  ₹{cat.spent.toLocaleString()} / ₹{cat.budget.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${cat.percentage > 100 ? 'bg-red-500' : cat.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5" />Savings Goals
          </h3>
          <button onClick={() => setShowSavingsGoals(!showSavingsGoals)} className="text-sm text-blue-600">
            {showSavingsGoals ? 'Hide' : 'Show'}
          </button>
        </div>
        {showSavingsGoals && (
          <div className="space-y-4">
            {savingsGoals.length === 0 ? (
              <p className="text-gray-500 text-sm">No savings goals yet. Add one to track your progress!</p>
            ) : (
              savingsGoals.map(goal => {
                const progress = (goal.current / goal.target) * 100
                return (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{goal.name}</span>
                      <span className="text-sm text-gray-600">₹{goal.current.toLocaleString()} / ₹{goal.target.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% complete</p>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Recurring Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Repeat className="w-5 h-5" />Recurring Templates
          </h3>
          <button onClick={() => setShowRecurring(!showRecurring)} className="text-sm text-blue-600">
            {showRecurring ? 'Hide' : 'Show'}
          </button>
        </div>
        {showRecurring && (
          <div className="grid grid-cols-2 gap-3">
            {recurringTemplates.length === 0 ? (
              <p className="text-gray-500 text-sm col-span-2">No templates yet. Create one to quickly add recurring expenses!</p>
            ) : (
              recurringTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyRecurringTemplate(template)}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  <div className="font-semibold">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.transactions.length} transactions</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Expense Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />Expense Trends
          </h3>
          <button onClick={() => setShowInsights(!showInsights)} className="text-sm text-blue-600">
            {showInsights ? 'Hide' : 'Show'}
          </button>
        </div>
        {showInsights && (
          <div>
            <div className="flex items-end gap-4 h-40">
              {trends.map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(month.expense / Math.max(...trends.map(m => m.expense))) * 100}%` }} />
                  <div className="text-xs mt-2">{month.month.split(' ')[0]}</div>
                  <div className="text-xs text-gray-600">₹{(month.expense / 1000).toFixed(0)}k</div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-gray-600">Avg Monthly Expense</div>
                <div className="text-xl font-bold">₹{(trends.reduce((sum, m) => sum + m.expense, 0) / trends.length).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm text-gray-600">Top Category</div>
                <div className="text-xl font-bold">{categorySpending[0]?.name || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
