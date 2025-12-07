import { useState } from 'react'
import { Plus, Minus, Upload, Download } from 'lucide-react'

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
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [bulkData, setBulkData] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [groupByCategory, setGroupByCategory] = useState(false)

  const downloadTemplate = () => {
    const template = 'Date,Particular,Category,Income,Expense,Mode\n2024-01-15,Salary,Salary,50000,0,Bank\n2024-01-16,Groceries,Food,0,2500,Cash'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transaction_template.csv'
    a.click()
  }

  const processBulkUpload = () => {
    const lines = bulkData.trim().split('\n')
    if (lines.length < 2) {
      alert('No data to upload')
      return
    }
    
    let addedCount = 0
    let duplicateCount = 0
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t')
      if (values.length < 6) continue
      
      const dateStr = values[0].trim()
      let formattedDate = dateStr
      
      // Handle DD/MM/YY or DD/MM/YYYY format (Excel default)
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0')
          const month = parts[1].padStart(2, '0')
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
          formattedDate = `${year}-${month}-${day}`
        }
      }
      // Handle DD-MM-YYYY format
      else if (dateStr.includes('-')) {
        const parts = dateStr.split('-')
        if (parts.length === 3 && parts[0].length <= 2) {
          formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      
      const newTxn = {
        date: formattedDate,
        particular: values[1].trim(),
        category: values[2].trim() || 'Uncategorized',
        income: parseFloat(values[3]) || 0,
        expense: parseFloat(values[4]) || 0,
        mode: values[5].trim()
      }
      
      const isDuplicate = transactions.some(t => 
        t.date === newTxn.date && 
        t.particular === newTxn.particular &&
        t.income === newTxn.income &&
        t.expense === newTxn.expense
      )
      
      if (!isDuplicate) {
        onAdd({
          ...newTxn,
          id: `txn_${Date.now()}_${i}`,
          stNo: transactions.length + addedCount + 1,
          createdAt: new Date().toISOString()
        })
        addedCount++
      } else {
        duplicateCount++
      }
    }
    
    alert(`Added ${addedCount} transactions. Skipped ${duplicateCount} duplicates.`)
    setBulkData('')
    setShowBulkUpload(false)
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const getSortedTransactions = (txns) => {
    return [...txns].sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (sortBy === 'date') {
        aVal = new Date(a.date).getTime()
        bVal = new Date(b.date).getTime()
      } else if (sortBy === 'income' || sortBy === 'expense') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else if (sortBy === 'stNo') {
        aVal = parseInt(aVal) || 0
        bVal = parseInt(bVal) || 0
      } else {
        aVal = String(aVal || '').toLowerCase()
        bVal = String(bVal || '').toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setGroupByCategory(!groupByCategory)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              groupByCategory 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {groupByCategory ? 'Ungroup' : 'Group by Category'}
          </button>
          {transactions.length > 0 && (
            <button 
              onClick={() => {
                if (confirm(`Delete all ${transactions.length} transactions? This cannot be undone.`)) {
                  transactions.forEach(t => onDelete(t.id))
                }
              }}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete All
            </button>
          )}
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
          <div className="flex gap-2">
            <button onClick={downloadTemplate} className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1">
              <Download className="w-3 h-3" />Template
            </button>
            <button onClick={() => setShowBulkUpload(true)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-1">
              <Upload className="w-3 h-3" />Bulk Upload
            </button>
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
          {groupByCategory ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(() => {
                const filtered = transactions.filter(t => {
                  const transactionDate = new Date(t.date)
                  return transactionDate.getFullYear() === year && transactionDate.getMonth() === viewMonth
                })
                const grouped = {}
                filtered.forEach(t => {
                  const cat = t.category || 'Uncategorized'
                  if (!grouped[cat]) grouped[cat] = []
                  grouped[cat].push(t)
                })
                return Object.entries(grouped).sort((a, b) => {
                  if (a[0] === 'Uncategorized') return -1
                  if (b[0] === 'Uncategorized') return 1
                  return a[0].localeCompare(b[0])
                }).map(([category, txns]) => {
                  const totalIncome = txns.reduce((sum, t) => sum + (t.income || 0), 0)
                  const totalExpense = txns.reduce((sum, t) => sum + (t.expense || 0), 0)
                  return (
                    <div key={category} className="p-4">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{category}</h3>
                        <div className="flex gap-4 text-sm">
                          {totalIncome > 0 && <span className="text-green-600">Income: ₹{totalIncome.toLocaleString()}</span>}
                          {totalExpense > 0 && <span className="text-red-600">Expense: ₹{totalExpense.toLocaleString()}</span>}
                          <span className="text-gray-500">{txns.length} txns</span>
                        </div>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Particular</th>
                            <th className="px-4 py-2 text-left">Category</th>
                            <th className="px-4 py-2 text-right">Income</th>
                            <th className="px-4 py-2 text-right">Expense</th>
                            <th className="px-4 py-2 text-left">Mode</th>
                            <th className="px-4 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSortedTransactions(txns).map((t, index) => (
                            <tr key={t.id || index} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                              <td className="px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
                              <td className="px-4 py-2">{t.particular}</td>
                              <td className="px-4 py-2">
                                <select
                                  value={t.category || 'Uncategorized'}
                                  onChange={(e) => {
                                    const updatedTransaction = {...t, category: e.target.value}
                                    onDelete(t.id)
                                    onAdd(updatedTransaction)
                                  }}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border-0"
                                >
                                  <option value="Uncategorized">Uncategorized</option>
                                  {budgetCategories.map((cat, idx) => (
                                    <option key={idx} value={cat.name}>{cat.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2 text-right text-green-600">
                                {t.income > 0 ? `₹${t.income.toLocaleString()}` : '-'}
                              </td>
                              <td className="px-4 py-2 text-right text-red-600">
                                {t.expense > 0 ? `₹${t.expense.toLocaleString()}` : '-'}
                              </td>
                              <td className="px-4 py-2">{t.mode}</td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => onDelete(t.id)}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                })
              })()}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th onClick={() => handleSort('stNo')} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    St.No {sortBy === 'stNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('date')} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('particular')} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    Particular {sortBy === 'particular' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('category')} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('income')} className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    Income {sortBy === 'income' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('expense')} className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    Expense {sortBy === 'expense' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('mode')} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    Mode {sortBy === 'mode' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {getSortedTransactions(transactions.filter(t => {
                  const transactionDate = new Date(t.date)
                  return transactionDate.getFullYear() === year && transactionDate.getMonth() === viewMonth
                })).map((t, index) => (
                  <tr key={t.id || index} className="border-t hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3">{t.stNo || index + 1}</td>
                    <td className="px-4 py-3">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{t.particular}</td>
                    <td className="px-4 py-3">
                      <select
                        value={t.category || 'Uncategorized'}
                        onChange={(e) => {
                          const updatedTransaction = {...t, category: e.target.value}
                          onDelete(t.id)
                          onAdd(updatedTransaction)
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border-0"
                      >
                        <option value="Uncategorized">Uncategorized</option>
                        {budgetCategories.map((cat, idx) => (
                          <option key={idx} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
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
          )}
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

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Bulk Upload Transactions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Copy data from Excel and paste below. Supports DD/MM/YY, DD-MM-YYYY formats.
            </p>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="w-full h-64 px-3 py-2 border rounded-lg dark:bg-gray-700 font-mono text-sm"
              placeholder="Date\tParticular\tCategory\tIncome\tExpense\tMode\n25/11/24\tSalary\tSalary\t50000\t\tBank\n26/11/24\tGroceries\tFood\t\t2500\tCash"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={processBulkUpload} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                Upload
              </button>
              <button onClick={() => { setShowBulkUpload(false); setBulkData(''); }} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}