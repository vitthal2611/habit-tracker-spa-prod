import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export default function Transactions({ transactions = [], budgetCategories = [], onAdd, onDelete, year = new Date().getFullYear() }) {
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    particular: '',
    category: '',
    income: 0,
    expense: 0,
    mode: 'Cash'
  })
  const [modes, setModes] = useState(['Cash', 'Card', 'UPI', 'Bank'])
  const [newMode, setNewMode] = useState('')
  const [showModeInput, setShowModeInput] = useState(false)

  const addTransaction = () => {
    if (!newTransaction.particular.trim()) {
      alert('Please enter transaction description')
      return
    }
    if (!newTransaction.category) {
      alert('Please select a category')
      return
    }
    if ((!newTransaction.income || newTransaction.income <= 0) && (!newTransaction.expense || newTransaction.expense <= 0)) {
      alert('Please enter either income or expense amount')
      return
    }
    if (newTransaction.income > 0 && newTransaction.expense > 0) {
      alert('Please enter either income OR expense, not both')
      return
    }
    
    onAdd({
      ...newTransaction,
      id: `txn_${Date.now()}`,
      stNo: transactions.length + 1,
      income: parseFloat(newTransaction.income) || 0,
      expense: parseFloat(newTransaction.expense) || 0,
      createdAt: new Date().toISOString()
    })
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      particular: '',
      category: '',
      income: 0,
      expense: 0,
      mode: 'Cash'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track income and expenses</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewMonth(viewMonth === 0 ? 11 : viewMonth - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-medium text-gray-900 dark:text-white min-w-[100px] text-center">{months[viewMonth]} {year}</span>
          <button onClick={() => setViewMonth(viewMonth === 11 ? 0 : viewMonth + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Monthly Income</div>
          <div className="text-2xl font-bold">₹{(transactions.filter(t => {
            const transactionDate = new Date(t.date)
            return transactionDate.getFullYear() === year && 
                   transactionDate.getMonth() === viewMonth &&
                   t.income > 0
          }).reduce((sum, t) => sum + (t.income || 0), 0) / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Budget Allocated</div>
          <div className="text-2xl font-bold">₹{(budgetCategories.reduce((sum, cat) => {
            if (cat.monthlyBudgets && cat.monthlyBudgets[viewMonth] !== undefined) {
              return sum + cat.monthlyBudgets[viewMonth]
            }
            return sum + (cat.monthlyBudget || 0)
          }, 0) / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Amount Spent</div>
          <div className="text-2xl font-bold">₹{(transactions.filter(t => {
            const transactionDate = new Date(t.date)
            return transactionDate.getFullYear() === year && 
                   transactionDate.getMonth() === viewMonth &&
                   t.expense > 0
          }).reduce((sum, t) => sum + (t.expense || 0), 0) / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Remaining</div>
          <div className="text-2xl font-bold">₹{((transactions.filter(t => {
            const transactionDate = new Date(t.date)
            return transactionDate.getFullYear() === year && 
                   transactionDate.getMonth() === viewMonth &&
                   t.income > 0
          }).reduce((sum, t) => sum + (t.income || 0), 0) - transactions.filter(t => {
            const transactionDate = new Date(t.date)
            return transactionDate.getFullYear() === year && 
                   transactionDate.getMonth() === viewMonth &&
                   t.expense > 0
          }).reduce((sum, t) => sum + (t.expense || 0), 0)) / 1000).toFixed(0)}k</div>
        </div>
      </div>

      {/* Add Transaction */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Transaction</h3>
          <div className="text-sm text-gray-500">
            {budgetCategories.length} categories available
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Particular"
            value={newTransaction.particular}
            onChange={(e) => setNewTransaction({...newTransaction, particular: e.target.value})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          />
          <select
            value={newTransaction.category}
            onChange={(e) => {
              const selectedCategory = budgetCategories.find(cat => cat.name === e.target.value)
              const isIncomeCategory = selectedCategory?.type === 'Income'
              setNewTransaction({
                ...newTransaction, 
                category: e.target.value,
                income: isIncomeCategory ? newTransaction.income : 0,
                expense: isIncomeCategory ? 0 : newTransaction.expense
              })
            }}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          >
            <option value="">Select Category</option>
            {budgetCategories.map((cat, index) => {
              const currentMonth = new Date().getMonth()
              const budget = (cat.monthlyBudgets && cat.monthlyBudgets[currentMonth] !== undefined) ? cat.monthlyBudgets[currentMonth] : (cat.monthlyBudget || 0)
              const spent = transactions.filter(t => {
                const transactionDate = new Date(t.date)
                return transactionDate.getFullYear() === year && 
                       transactionDate.getMonth() === currentMonth &&
                       t.category === cat.name &&
                       t.expense > 0
              }).reduce((sum, t) => sum + (t.expense || 0), 0)
              const remaining = budget - spent
              return (
                <option key={index} value={cat.name} style={{color: remaining < 0 ? 'red' : 'inherit'}}>
                  {cat.name} (₹{remaining.toLocaleString('en-IN')} left)
                </option>
              )
            })}
          </select>
          <input
            type="number"
            placeholder="Income"
            value={newTransaction.income || ''}
            onChange={(e) => setNewTransaction({...newTransaction, income: e.target.value, expense: 0})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={newTransaction.category && budgetCategories.find(cat => cat.name === newTransaction.category)?.type !== 'Income'}
          />
          <input
            type="number"
            placeholder="Expense"
            value={newTransaction.expense || ''}
            onChange={(e) => setNewTransaction({...newTransaction, expense: e.target.value, income: 0})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={newTransaction.category && budgetCategories.find(cat => cat.name === newTransaction.category)?.type === 'Income'}
          />
          <div className="relative">
            <select
              value={newTransaction.mode}
              onChange={(e) => {
                if (e.target.value === 'ADD_NEW') {
                  setShowModeInput(true)
                } else {
                  setNewTransaction({...newTransaction, mode: e.target.value})
                }
              }}
              onDoubleClick={() => {
                if (newTransaction.mode && modes.length > 1) {
                  if (confirm(`Delete mode "${newTransaction.mode}"?`)) {
                    setModes(modes.filter(m => m !== newTransaction.mode))
                    setNewTransaction({...newTransaction, mode: modes.find(m => m !== newTransaction.mode) || 'Cash'})
                  }
                }
              }}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 w-full"
            >
              {modes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
              <option value="ADD_NEW">+ Add New Mode</option>
            </select>
            {showModeInput && (
              <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="New mode"
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm dark:bg-gray-700"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMode.trim()) {
                        setModes([...modes, newMode.trim()])
                        setNewTransaction({...newTransaction, mode: newMode.trim()})
                        setNewMode('')
                        setShowModeInput(false)
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMode.trim()) {
                        setModes([...modes, newMode.trim()])
                        setNewTransaction({...newTransaction, mode: newMode.trim()})
                        setNewMode('')
                        setShowModeInput(false)
                      }
                    }}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setShowModeInput(false)
                      setNewMode('')
                    }}
                    className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={addTransaction}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />Add
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">St.No</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Particular</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Income</th>
                <th className="px-4 py-3 text-right">Expense</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(t => {
                const transactionDate = new Date(t.date)
                return transactionDate.getFullYear() === year && transactionDate.getMonth() === viewMonth
              }).map((t, index) => (
                <tr key={t.id || index} className="border-t hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3">{t.stNo || index + 1}</td>
                  <td className="px-4 py-3">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{t.particular}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {t.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {t.income > 0 ? `₹${t.income.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {t.expense > 0 ? `₹${t.expense.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3">{t.mode}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.filter(t => {
                const transactionDate = new Date(t.date)
                return transactionDate.getFullYear() === year && transactionDate.getMonth() === viewMonth
              }).length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No transactions yet. Add your first transaction above.
                  </td>
                </tr>
              )}
              {budgetCategories.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-yellow-600 bg-yellow-50">
                    ⚠️ No budget categories found. Please create budget categories first in the Budget tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400">Total Income</div>
          <div className="text-xl font-bold text-green-700 dark:text-green-300">
            ₹{transactions.reduce((sum, t) => sum + (parseFloat(t.income) || 0), 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {transactions.filter(t => t.income > 0).length} transactions
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400">Total Expense</div>
          <div className="text-xl font-bold text-red-700 dark:text-red-300">
            ₹{transactions.reduce((sum, t) => sum + (parseFloat(t.expense) || 0), 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {transactions.filter(t => t.expense > 0).length} transactions
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400">Net Balance</div>
          <div className={`text-xl font-bold ${
            (transactions.reduce((sum, t) => sum + (parseFloat(t.income) || 0) - (parseFloat(t.expense) || 0), 0)) >= 0 
            ? 'text-green-700 dark:text-green-300' 
            : 'text-red-700 dark:text-red-300'
          }`}>
            ₹{(transactions.reduce((sum, t) => sum + (parseFloat(t.income) || 0) - (parseFloat(t.expense) || 0), 0)).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {transactions.length} total transactions
          </div>
        </div>
      </div>
    </div>
  )
}