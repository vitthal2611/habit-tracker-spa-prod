import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react'

export default function ExpenseManager({ transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction, budgets, onSaveBudgets, budgetFlowData }) {
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showManageCategories, setShowManageCategories] = useState(false)
  const [budgetMonth, setBudgetMonth] = useState(new Date(2025, 10, 25))
  const [budgetStartDay] = useState(25)
  const defaultCategories = [
    { name: 'EMI', budget: 0 },
    { name: 'DMART & Oil', budget: 0 },
    { name: 'Milk', budget: 0 },
    { name: 'Gas', budget: 0 },
    { name: 'Water', budget: 0 },
    { name: 'Electricity', budget: 0 },
    { name: 'Bai', budget: 0 },
    { name: 'Petrol', budget: 0 },
    { name: 'baby-School', budget: 0 },
    { name: 'School', budget: 0 },
    { name: 'Vegetable', budget: 0 },
    { name: 'Med-Amruta', budget: 0 },
    { name: 'Med-Insurance', budget: 0 },
    { name: 'Vacation', budget: 0 },
    { name: 'Wife SIP', budget: 0 },
    { name: 'SSY', budget: 0 },
    { name: 'BabySIP', budget: 0 },
    { name: 'My SIP', budget: 0 },
    { name: 'Salary', budget: 0 }
  ]
  const [modes, setModes] = useState(['HDFC', 'SBI Credit Card', 'Cash'])
  const [categories, setCategories] = useState(defaultCategories)
  const [monthlyBudgets, setMonthlyBudgets] = useState(budgets || {})

  useEffect(() => {
    if (budgets) setMonthlyBudgets(budgets)
  }, [budgets])
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
  const [formStep, setFormStep] = useState(0)

  useEffect(() => {
    const uniqueModes = [...new Set(transactions.map(t => t.mode).filter(Boolean))]
    if (uniqueModes.length > 0) {
      setModes(prev => [...new Set([...prev, ...uniqueModes])])
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
    
    // Check budget flow first
    if (transactionForm.type === 'expense' && budgetFlowData) {
      const txnDate = new Date(transactionForm.date)
      const monthKey = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`
      const monthBudget = budgetFlowData.find(b => b.month === monthKey)
      
      if (monthBudget?.allocations) {
        const categoryKeys = Object.keys(monthBudget.allocations).filter(k => k.includes(transactionForm.category))
        if (categoryKeys.length > 0) {
          const budgetAmount = categoryKeys.reduce((sum, key) => sum + (monthBudget.allocations[key] || 0), 0)
          const spent = transactions
            .filter(t => {
              const tDate = new Date(t.date)
              return t.category === transactionForm.category && t.type === 'expense' && 
                     `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}` === monthKey
            })
            .reduce((sum, t) => sum + t.amount, 0)
          
          if (spent + amount > budgetAmount) {
            const monthName = new Date(monthKey + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })
            alert(`Budget exceeded for ${transactionForm.category} in ${monthName}!\nBudget: ₹${budgetAmount.toLocaleString()}\nAlready spent: ₹${spent.toLocaleString()}\nAvailable: ₹${(budgetAmount - spent).toLocaleString()}\nTrying to add: ₹${amount.toLocaleString()}`)
            return
          }
        }
      }
    }
    
    const currentBudget = monthlyBudgets[currentMonthKey] || []
    const category = currentBudget.find(c => c.name === transactionForm.category)
    
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
    setFormStep(0)
    setShowAddTransaction(false)
  }

  const monthlyData = getMonthlyData()

  const currentMonthKey = budgetMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })
  const hasCurrentMonthBudget = monthlyBudgets[currentMonthKey] && monthlyBudgets[currentMonthKey].length > 0

  const getPreviousMonthKey = () => {
    const prevMonth = new Date(budgetMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    return prevMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })
  }

  const copyFromPreviousMonth = () => {
    const prevMonthKey = getPreviousMonthKey()
    if (monthlyBudgets[prevMonthKey]) {
      setMonthlyBudgets({
        ...monthlyBudgets,
        [currentMonthKey]: [...monthlyBudgets[prevMonthKey]]
      })
    }
  }

  if (!hasCurrentMonthBudget) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl shadow-md border-2 border-indigo-200 dark:border-indigo-800/30">
          <div className="text-6xl mb-6">💰</div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Set Budget for {currentMonthKey}</h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Create your monthly budget to start tracking expenses</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                const updated = { ...monthlyBudgets, [currentMonthKey]: [...defaultCategories] };
                setMonthlyBudgets(updated);
                onSaveBudgets(updated);
                setShowManageCategories(true);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold"
            >
              Create Budget
            </button>
            {monthlyBudgets[getPreviousMonthKey()] && (
              <button
                onClick={() => {
                  const prevMonthKey = getPreviousMonthKey();
                  if (monthlyBudgets[prevMonthKey]) {
                    const updated = { ...monthlyBudgets, [currentMonthKey]: [...monthlyBudgets[prevMonthKey]] };
                    setMonthlyBudgets(updated);
                    onSaveBudgets(updated);
                    setShowManageCategories(true);
                  }
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg font-semibold"
              >
                Copy from {getPreviousMonthKey()}
              </button>
            )}
          </div>
        </div>

        {showManageCategories && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Categories</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Set budgets and monthly overrides</p>
                </div>
                <button onClick={() => setShowManageCategories(false)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {(monthlyBudgets[currentMonthKey] || []).map((cat, idx) => (
                  <div key={cat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => {
                          const newCats = [...(monthlyBudgets[currentMonthKey] || [])]
                          newCats[idx] = { ...newCats[idx], name: e.target.value }
                          setMonthlyBudgets({ ...monthlyBudgets, [currentMonthKey]: newCats })
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Category name"
                      />
                      <input
                        type="number"
                        value={cat.budget || ''}
                        onChange={(e) => {
                          const newCats = [...(monthlyBudgets[currentMonthKey] || [])]
                          newCats[idx] = { ...newCats[idx], budget: e.target.value ? parseFloat(e.target.value) : null }
                          setMonthlyBudgets({ ...monthlyBudgets, [currentMonthKey]: newCats })
                        }}
                        className="w-32 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Default Budget"
                      />
                      <button
                        onClick={() => {
                          const newCats = (monthlyBudgets[currentMonthKey] || []).filter((_, i) => i !== idx)
                          setMonthlyBudgets({ ...monthlyBudgets, [currentMonthKey]: newCats })
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const current = monthlyBudgets[currentMonthKey] || []
                  setMonthlyBudgets({ ...monthlyBudgets, [currentMonthKey]: [...current, { name: '', budget: null }] })
                }}
                className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />Add Category
              </button>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const current = monthlyBudgets[currentMonthKey] || []
                    if (current.length > 0 && current.every(c => c.name && c.budget !== null && c.budget !== undefined)) {
                      setShowManageCategories(false)
                    } else {
                      alert('Please set budget for all categories')
                    }
                  }}
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
                            
                            // Check budget flow first
                            if (budgetFlowData) {
                              const txnDate = new Date(txn.date)
                              const monthKey = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`
                              const monthBudget = budgetFlowData.find(b => b.month === monthKey)
                              
                              if (monthBudget?.allocations) {
                                const categoryKeys = Object.keys(monthBudget.allocations).filter(k => k.includes(txn.category))
                                if (categoryKeys.length > 0) {
                                  const budgetAmount = categoryKeys.reduce((sum, key) => sum + (monthBudget.allocations[key] || 0), 0)
                                  const spent = transactions
                                    .filter(t => {
                                      const tDate = new Date(t.date)
                                      return t.id !== txn.id && t.category === txn.category && t.type === 'expense' && 
                                             `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}` === monthKey
                                    })
                                    .reduce((sum, t) => sum + t.amount, 0)
                                  
                                  if (spent + amount > budgetAmount) {
                                    const monthName = new Date(monthKey + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })
                                    alert(`Budget exceeded for ${txn.category} in ${monthName}!\nBudget: ₹${budgetAmount.toLocaleString()}\nAlready spent: ₹${spent.toLocaleString()}\nAvailable: ₹${(budgetAmount - spent).toLocaleString()}\nTrying to set: ₹${amount.toLocaleString()}`)
                                    setEditingCell(null)
                                    return
                                  }
                                }
                              }
                            }
                            
                            const currentBudget = monthlyBudgets[currentMonthKey] || []
                            const category = currentBudget.find(c => c.name === txn.category)
                            
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
                          {(monthlyBudgets[currentMonthKey] || []).map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
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
              <button onClick={() => { setShowAddTransaction(false); setFormStep(0); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-4">
              {formStep === 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setTransactionForm({ ...transactionForm, type: 'income' }); setFormStep(1); }} className="px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 font-semibold">Income</button>
                    <button onClick={() => { setTransactionForm({ ...transactionForm, type: 'expense' }); setFormStep(1); }} className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 font-semibold">Expense</button>
                  </div>
                </div>
              )}

              {formStep === 1 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select value={transactionForm.category} onChange={(e) => { if (e.target.value === '__add_new__') { setShowAddCategory(true); } else { setTransactionForm({ ...transactionForm, category: e.target.value }); setFormStep(2); } }} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" autoFocus>
                    <option value="">Select category</option>
                    {(monthlyBudgets[currentMonthKey] || []).map(cat => <option key={cat.name} value={cat.name}>{cat.name}{cat.budget ? ` (₹${cat.budget.toLocaleString()})` : ''}</option>)}
                    <option value="__add_new__">+ Add New Category</option>
                  </select>
                  {showAddCategory && (
                    <div className="mt-2 flex gap-2">
                      <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="Enter new category" autoFocus />
                      <button onClick={() => { if (newCategory.trim()) { const current = monthlyBudgets[currentMonthKey] || []; setMonthlyBudgets({ ...monthlyBudgets, [currentMonthKey]: [...current, { name: newCategory.trim(), budget: 0 }] }); setTransactionForm({ ...transactionForm, category: newCategory.trim() }); setNewCategory(''); setShowAddCategory(false); setFormStep(2); } }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add</button>
                      <button onClick={() => { setShowAddCategory(false); setNewCategory(''); }} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Cancel</button>
                    </div>
                  )}
                </div>
              )}

              {formStep === 2 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input type="number" value={transactionForm.amount} onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && transactionForm.amount && setFormStep(3)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="0" autoFocus />
                  <button onClick={() => transactionForm.amount && setFormStep(3)} className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Next</button>
                </div>
              )}

              {formStep === 3 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Particular</label>
                  <input type="text" value={transactionForm.description} onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && setFormStep(4)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="Description" autoFocus />
                  <button onClick={() => setFormStep(4)} className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Next</button>
                </div>
              )}

              {formStep === 4 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Mode</label>
                  <select value={transactionForm.mode} onChange={(e) => { if (e.target.value === '__add_new__') { setShowAddMode(true); } else { setTransactionForm({ ...transactionForm, mode: e.target.value }); setFormStep(5); } }} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" autoFocus>
                    <option value="">Select mode</option>
                    {modes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                    <option value="__add_new__">+ Add New Mode</option>
                  </select>
                  {showAddMode && (
                    <div className="mt-2 flex gap-2">
                      <input type="text" value={newMode} onChange={(e) => setNewMode(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="Enter new mode" autoFocus />
                      <button onClick={() => { if (newMode.trim()) { setModes([...modes, newMode.trim()]); setTransactionForm({ ...transactionForm, mode: newMode.trim() }); setNewMode(''); setShowAddMode(false); setFormStep(5); } }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add</button>
                      <button onClick={() => { setShowAddMode(false); setNewMode(''); }} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Cancel</button>
                    </div>
                  )}
                </div>
              )}

              {formStep === 5 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input type="date" value={transactionForm.date} onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" autoFocus />
                  <button onClick={handleAddTransaction} className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Transaction</button>
                </div>
              )}
            </div>

            {formStep > 0 && (
              <button onClick={() => setFormStep(formStep - 1)} className="w-full mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300">Back</button>
            )}
          </div>
        </div>
      )}

      {showManageCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Categories for {currentMonthKey}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your expense categories and budgets</p>
              </div>
              <button onClick={() => setShowManageCategories(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            
            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              <div className="grid gap-3">
                {categories.map((cat, idx) => (
                  <div key={idx} className="group bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => {
                            const newCats = [...categories]
                            newCats[idx].name = e.target.value
                            setCategories(newCats)
                          }}
                          className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-600 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
                          placeholder="Category name"
                        />
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                          <input
                            type="number"
                            value={cat.budget || ''}
                            onChange={(e) => {
                              const newCats = [...categories]
                              newCats[idx].budget = e.target.value ? parseFloat(e.target.value) : null
                              setCategories(newCats)
                            }}
                            className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-600 font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all"
                            placeholder="Budget"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setCategories(categories.filter((_, i) => i !== idx))}
                        className="p-2.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => setCategories([...categories, { name: '', budget: null }])}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />Add New Category
              </button>
              <button
                onClick={() => { 
                  const updated = { ...monthlyBudgets, [currentMonthKey]: categories };
                  setMonthlyBudgets(updated);
                  onSaveBudgets(updated);
                  setShowManageCategories(false);
                }}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all"
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
