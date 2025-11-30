import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react'

export default function ExpenseManager({ transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction }) {
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showManageCategories, setShowManageCategories] = useState(false)
  const [budgetMonth, setBudgetMonth] = useState(new Date(2025, 10, 25))
  const [budgetStartDay] = useState(25)
  const [modes, setModes] = useState(['HDFC', 'SBI Credit Card', 'Cash'])
  const [categories, setCategories] = useState([
    { name: 'EMI', budget: 75000, monthlyBudgets: {} },
    { name: 'Groceries', budget: 7800, monthlyBudgets: {} },
    { name: 'Petrol', budget: 5000, monthlyBudgets: {} },
    { name: 'Salary', budget: null, monthlyBudgets: {} },
    { name: 'Wife SIP', budget: 20000, monthlyBudgets: { 'Nov-2025': 20000, 'Dec-2025': 21000 } }
  ])
  const [showAddMode, setShowAddMode] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newMode, setNewMode] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    mode: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const uniqueModes = [...new Set(transactions.map(t => t.mode).filter(Boolean))]
    const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))]
    if (uniqueModes.length > 0) {
      setModes(prev => [...new Set([...prev, ...uniqueModes])])
    }
    if (uniqueCategories.length > 0) {
      const newCats = uniqueCategories.filter(cat => !categories.find(c => c.name === cat))
      if (newCats.length > 0) {
        setCategories(prev => [...prev, ...newCats.map(name => ({ name, budget: null, monthlyBudgets: {} }))])
      }
    }
  }, [transactions])

  const currentMonth = budgetMonth.toLocaleString('default', { month: 'short', year: 'numeric' })
  
  const getBudgetPeriod = () => {
    const year = budgetMonth.getFullYear()
    const month = budgetMonth.getMonth()
    const startDate = new Date(year, month, budgetStartDay)
    const endDate = new Date(year, month + 1, budgetStartDay - 1)
    return { startDate, endDate }
  }
  
  const getMonthlyData = () => {
    const { startDate, endDate } = getBudgetPeriod()
    const monthTransactions = transactions.filter(t => {
      const txnDate = new Date(t.date)
      return txnDate >= startDate && txnDate <= endDate
    })
    
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    
    return { income, expense, balance: income - expense, transactions: monthTransactions }
  }

  const handleAddTransaction = async () => {
    if (!transactionForm.category || !transactionForm.amount) return
    
    const amount = parseFloat(transactionForm.amount)
    const category = categories.find(c => c.name === transactionForm.category)
    
    if (category && transactionForm.type === 'expense') {
      const txnDate = new Date(transactionForm.date + 'T00:00:00')
      const txnYear = txnDate.getFullYear()
      const txnMonth = txnDate.getMonth()
      const txnDay = txnDate.getDate()
      
      let periodStart, periodEnd, monthKey
      if (txnDay >= budgetStartDay) {
        periodStart = new Date(txnYear, txnMonth, budgetStartDay, 0, 0, 0)
        periodEnd = new Date(txnYear, txnMonth + 1, budgetStartDay - 1, 23, 59, 59)
        monthKey = periodStart.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      } else {
        periodStart = new Date(txnYear, txnMonth - 1, budgetStartDay, 0, 0, 0)
        periodEnd = new Date(txnYear, txnMonth, budgetStartDay - 1, 23, 59, 59)
        monthKey = periodStart.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      }
      
      const monthBudget = category.monthlyBudgets?.[monthKey] ?? category.budget
      
      if (monthBudget) {
        const spent = transactions
          .filter(t => {
            const tDate = new Date(t.date + 'T00:00:00')
            return t.category === transactionForm.category && t.type === 'expense' && tDate >= periodStart && tDate <= periodEnd
          })
          .reduce((sum, t) => sum + t.amount, 0)
        
        if (spent + amount > monthBudget) {
          alert(`Budget exceeded for ${monthKey}!\nBudget: ₹${monthBudget.toLocaleString()}\nAlready spent: ₹${spent.toLocaleString()}\nAvailable: ₹${(monthBudget - spent).toLocaleString()}\nTrying to add: ₹${amount.toLocaleString()}`);
          return
        }
      }
    }
    
    await onAddTransaction({
      ...transactionForm,
      amount,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    })
    
    setTransactionForm({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      mode: '',
      date: new Date().toISOString().split('T')[0]
    })
    setShowAddTransaction(false)
  }

  const monthlyData = getMonthlyData()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Expense Manager</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Track your income and expenses</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowManageCategories(true)}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
            >
              Categories
            </button>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />Add
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-fit mx-auto">
          <button onClick={() => {
            const newDate = new Date(budgetMonth)
            newDate.setMonth(newDate.getMonth() - 1)
            setBudgetMonth(newDate)
          }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">&lt;</button>
          <span className="font-bold text-sm min-w-[80px] text-center text-gray-900 dark:text-white">{currentMonth}</span>
          <button onClick={() => {
            const newDate = new Date(budgetMonth)
            newDate.setMonth(newDate.getMonth() + 1)
            setBudgetMonth(newDate)
          }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">&gt;</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 sm:p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Income</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">₹{monthlyData.income.toLocaleString()}</div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 sm:p-5 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            <span className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">Expense</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-red-700 dark:text-red-300">₹{monthlyData.expense.toLocaleString()}</div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-5 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Balance</span>
          </div>
          <div className={`text-lg sm:text-2xl font-bold ${monthlyData.balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
            ₹{monthlyData.balance.toLocaleString()}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 sm:p-5 border border-purple-200 dark:border-purple-800 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">Payment Modes</span>
          </div>
          <div className="space-y-1 text-xs max-h-16 sm:max-h-20 overflow-y-auto">
            {modes.map(mode => {
              const modeBalance = monthlyData.transactions
                .filter(t => t.mode === mode)
                .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
              return modeBalance !== 0 ? (
                <div key={mode} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 truncate">{mode}:</span>
                  <span className={`font-semibold ${modeBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{modeBalance.toLocaleString()}</span>
                </div>
              ) : null
            })}
            {modes.every(mode => monthlyData.transactions.filter(t => t.mode === mode).length === 0) && (
              <div className="text-gray-400 text-center py-2">No transactions</div>
            )}
          </div>
        </div>
      </div>



      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Transactions</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Double-click any cell to edit</p>
          </div>
          <button
            onClick={async () => {
              await onAddTransaction({
                type: 'expense',
                category: '',
                amount: 0,
                description: '',
                mode: '',
                date: new Date().toISOString().split('T')[0],
                id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString()
              })
            }}
            className="px-2 sm:px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />Quick Add
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">#</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Particular</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-900 dark:text-white">Income</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-900 dark:text-white">Expense</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white hidden md:table-cell">Category</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white hidden lg:table-cell">Mode</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Balance</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 30 }, (_, i) => {
                const txn = monthlyData.transactions.sort((a, b) => new Date(a.date) - new Date(b.date))[i]
                let balance = 0
                if (txn) {
                  for (let j = 0; j <= i; j++) {
                    const t = monthlyData.transactions.sort((a, b) => new Date(a.date) - new Date(b.date))[j]
                    if (t) {
                      balance += t.type === 'income' ? t.amount : -t.amount
                    }
                  }
                }
                
                const handleSave = async (field) => {
                  if (editValue.trim() && txn) {
                    await onUpdateTransaction({ ...txn, [field]: field === 'amount' ? parseFloat(editValue) : editValue })
                    setEditingCell(null)
                  }
                }

                return (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white">{i + 1}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white" onDoubleClick={() => { if (txn) { setEditingCell(`${txn.id}-date`); setEditValue(txn.date); } }}>
                      {editingCell === `${txn?.id}-date` ? (
                        <input type="date" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleSave('date')} onKeyDown={(e) => e.key === 'Enter' && handleSave('date')} className="w-full px-2 py-1 border rounded dark:bg-gray-700" autoFocus />
                      ) : txn ? new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white hidden sm:table-cell" onDoubleClick={() => { if (txn) { setEditingCell(`${txn.id}-description`); setEditValue(txn.description); } }}>
                      {editingCell === `${txn?.id}-description` ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleSave('description')} onKeyDown={(e) => e.key === 'Enter' && handleSave('description')} className="w-full px-2 py-1 border rounded dark:bg-gray-700" autoFocus />
                      ) : txn?.description || ''}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-green-600 dark:text-green-400 font-semibold" onDoubleClick={() => { if (txn) { setEditingCell(`${txn.id}-income`); setEditValue(txn.amount); } }}>
                      {editingCell === `${txn?.id}-income` ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={async () => { if (editValue && txn) { await onUpdateTransaction({ ...txn, amount: parseFloat(editValue), type: 'income' }); setEditingCell(null); } }} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-right" autoFocus />
                      ) : txn?.type === 'income' ? `₹${txn.amount.toLocaleString()}` : ''}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-red-600 dark:text-red-400 font-semibold" onDoubleClick={() => { if (txn) { setEditingCell(`${txn.id}-expense`); setEditValue(txn.amount); } }}>
                      {editingCell === `${txn?.id}-expense` ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={async () => {
                          if (editValue && txn) {
                            const amount = parseFloat(editValue)
                            const category = categories.find(c => c.name === txn.category)
                            
                            if (category) {
                              const txnDate = new Date(txn.date + 'T00:00:00')
                              const txnYear = txnDate.getFullYear()
                              const txnMonth = txnDate.getMonth()
                              const txnDay = txnDate.getDate()
                              
                              let periodStart, periodEnd, monthKey
                              if (txnDay >= budgetStartDay) {
                                periodStart = new Date(txnYear, txnMonth, budgetStartDay, 0, 0, 0)
                                periodEnd = new Date(txnYear, txnMonth + 1, budgetStartDay - 1, 23, 59, 59)
                                monthKey = periodStart.toLocaleString('en-US', { month: 'short', year: 'numeric' })
                              } else {
                                periodStart = new Date(txnYear, txnMonth - 1, budgetStartDay, 0, 0, 0)
                                periodEnd = new Date(txnYear, txnMonth, budgetStartDay - 1, 23, 59, 59)
                                monthKey = periodStart.toLocaleString('en-US', { month: 'short', year: 'numeric' })
                              }
                              
                              const monthBudget = category.monthlyBudgets?.[monthKey] ?? category.budget
                              
                              if (monthBudget) {
                                const spent = transactions
                                  .filter(t => {
                                    const tDate = new Date(t.date + 'T00:00:00')
                                    return t.id !== txn.id && t.category === txn.category && t.type === 'expense' && tDate >= periodStart && tDate <= periodEnd
                                  })
                                  .reduce((sum, t) => sum + t.amount, 0)
                                
                                if (spent + amount > monthBudget) {
                                  alert(`Budget exceeded for ${monthKey}!\nBudget: ₹${monthBudget.toLocaleString()}\nAlready spent: ₹${spent.toLocaleString()}\nAvailable: ₹${(monthBudget - spent).toLocaleString()}\nTrying to set: ₹${amount.toLocaleString()}`)
                                  setEditingCell(null)
                                  return
                                }
                              }
                            }
                            
                            await onUpdateTransaction({ ...txn, amount, type: 'expense' })
                            setEditingCell(null)
                          }
                        }} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-right" autoFocus />
                      ) : txn?.type === 'expense' ? `₹${txn.amount.toLocaleString()}` : ''}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white hidden md:table-cell" onDoubleClick={() => { if (txn) { setEditingCell(`${txn.id}-category`); setEditValue(txn.category); } }}>
                      {editingCell === `${txn?.id}-category` ? (
                        <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleSave('category')} className="w-full px-2 py-1 border rounded dark:bg-gray-700" autoFocus>
                          <option value="">Select category</option>
                          {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                        </select>
                      ) : txn?.category || ''}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white hidden lg:table-cell" onDoubleClick={() => { if (txn) { setEditingCell(`${txn.id}-mode`); setEditValue(txn.mode); } }}>
                      {editingCell === `${txn?.id}-mode` ? (
                        <select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleSave('mode')} className="w-full px-2 py-1 border rounded dark:bg-gray-700" autoFocus>
                          <option value="">Select mode</option>
                          {modes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                        </select>
                      ) : txn?.mode || ''}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-gray-900 dark:text-white hidden sm:table-cell">
                      {txn ? `₹${balance.toLocaleString()}` : ''}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {txn && (
                        <button onClick={async () => await onDeleteTransaction(txn.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h3>
              <button onClick={() => setShowAddTransaction(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value, category: '' })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={transactionForm.category}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddCategory(true)
                    } else {
                      setTransactionForm({ ...transactionForm, category: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}{cat.budget ? ` (₹${cat.budget.toLocaleString()})` : ''}</option>
                  ))}
                  <option value="__add_new__">+ Add New Category</option>
                </select>
                {showAddCategory && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter new category"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (newCategory.trim()) {
                          setCategories([...categories, { name: newCategory.trim(), budget: null, monthlyBudgets: {} }])
                          setTransactionForm({ ...transactionForm, category: newCategory.trim() })
                          setNewCategory('')
                          setShowAddCategory(false)
                        }
                      }}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddCategory(false); setNewCategory('') }}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Particular</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <select
                  value={transactionForm.mode}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddMode(true)
                    } else {
                      setTransactionForm({ ...transactionForm, mode: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select mode</option>
                  {modes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                  <option value="__add_new__">+ Add New Mode</option>
                </select>
                {showAddMode && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newMode}
                      onChange={(e) => setNewMode(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter new mode"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (newMode.trim()) {
                          setModes([...modes, newMode.trim()])
                          setTransactionForm({ ...transactionForm, mode: newMode.trim() })
                          setNewMode('')
                          setShowAddMode(false)
                        }
                      }}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddMode(false); setNewMode('') }}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddTransaction(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showManageCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Categories</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set budgets and monthly overrides</p>
              </div>
              <button onClick={() => setShowManageCategories(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {categories.map((cat, idx) => (
                <div key={cat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => {
                        const newCats = [...categories]
                        newCats[idx].name = e.target.value
                        setCategories(newCats)
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                      placeholder="Category name"
                    />
                    <input
                      type="number"
                      value={cat.budget || ''}
                      onChange={(e) => {
                        const newCats = [...categories]
                        newCats[idx].budget = e.target.value ? parseFloat(e.target.value) : null
                        setCategories(newCats)
                      }}
                      className="w-32 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                      placeholder="Default Budget"
                    />
                    <button
                      onClick={() => setCategories(categories.filter((_, i) => i !== idx))}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="ml-4 space-y-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Monthly Overrides:</div>
                    {Object.entries(cat.monthlyBudgets || {}).map(([month, budget]) => (
                      <div key={month} className="flex items-center gap-2">
                        <input type="text" value={month} readOnly className="w-32 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:border-gray-500" />
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => {
                            const newCats = [...categories]
                            newCats[idx].monthlyBudgets[month] = parseFloat(e.target.value)
                            setCategories(newCats)
                          }}
                          className="w-28 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:border-gray-500"
                        />
                        <button
                          onClick={() => {
                            const newCats = [...categories]
                            delete newCats[idx].monthlyBudgets[month]
                            setCategories(newCats)
                          }}
                          className="text-red-500 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="month"
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value + '-01')
                            const month = date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
                            const newCats = [...categories]
                            if (!newCats[idx].monthlyBudgets) newCats[idx].monthlyBudgets = {}
                            if (!newCats[idx].monthlyBudgets[month]) {
                              newCats[idx].monthlyBudgets[month] = cat.budget || 0
                              setCategories(newCats)
                            }
                            e.target.value = ''
                          }
                        }}
                        className="w-40 px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Select month"
                      />
                      <span className="text-xs text-gray-500">to add override</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCategories([...categories, { name: '', budget: null, monthlyBudgets: {} }])}
              className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />Add Category
            </button>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowManageCategories(false)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
