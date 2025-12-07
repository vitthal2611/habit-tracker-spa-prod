import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Plus, Minus } from 'lucide-react'
import { DEFAULT_BUDGET_CATEGORIES } from '../utils/budgetCategories'

export default function YearlyBudget({ budgetData, transactions = [], onSave, dbYearlyBudgets = [] }) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  const [year, setYear] = useState(currentYear)
  const [monthlyIncome, setMonthlyIncome] = useState(Array(12).fill(0))
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [viewMonth, setViewMonth] = useState(currentMonth)
  const [viewYear, setViewYear] = useState(currentYear)
  const [showSetup, setShowSetup] = useState(false)
  const [showIncome, setShowIncome] = useState(false)
  const [monthRanges, setMonthRanges] = useState(Array(12).fill(null).map((_, i) => ({ 
    startDate: `${year}-${String(i + 1).padStart(2, '0')}-01`, 
    endDate: `${year}-${String(i + 1).padStart(2, '0')}-${new Date(year, i + 1, 0).getDate()}` 
  })))
  const [showDateRanges, setShowDateRanges] = useState(false)


  useEffect(() => {
    // Find budget data for selected year
    const yearBudget = dbYearlyBudgets?.find(b => b.year === year)
    const ranges = yearBudget?.monthRanges || Array(12).fill(null).map((_, i) => ({ 
      startDate: `${year}-${String(i + 1).padStart(2, '0')}-01`, 
      endDate: `${year}-${String(i + 1).padStart(2, '0')}-${new Date(year, i + 1, 0).getDate()}` 
    }))
    
    if (yearBudget) {
      setCategories(yearBudget.categories || [])
      setMonthRanges(ranges)
    } else {
      setCategories([])
      setMonthRanges(ranges)
    }
    
    // Calculate monthly income from transactions based on date ranges
    const calculatedIncome = Array(12).fill(0)
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      if (transactionDate.getFullYear() === year && transaction.income > 0) {
        const dateStr = transactionDate.toISOString().split('T')[0]
        let month = transactionDate.getMonth()
        
        // Find matching month range
        for (let i = 0; i < 12; i++) {
          const range = ranges[i]
          if (range?.startDate && range?.endDate && dateStr >= range.startDate && dateStr <= range.endDate) {
            month = i
            break
          }
        }
        
        calculatedIncome[month] += transaction.income
      }
    })
    setMonthlyIncome(calculatedIncome)
  }, [dbYearlyBudgets, transactions, year])

  const getMonthFromDateRange = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    for (let i = 0; i < 12; i++) {
      const range = monthRanges[i]
      if (!range || !range.startDate || !range.endDate) continue
      
      if (dateStr >= range.startDate && dateStr <= range.endDate) return i
    }
    return date.getMonth()
  }

  const updateMonthRange = (monthIndex, field, value) => {
    const updated = [...monthRanges]
    updated[monthIndex][field] = value
    setMonthRanges(updated)
  }

  const addCategory = () => {
    setCategories([...categories, { name: '', monthlyBudgets: Array(12).fill(0), type: 'Expense', priority: categories.length + 1 }])
  }

  const updateCategory = (index, field, value) => {
    const updated = [...categories]
    updated[index][field] = value
    setCategories(updated)
  }

  const updateCategoryMonth = (categoryIndex, monthIndex, value) => {
    const updated = [...categories]
    if (!updated[categoryIndex].monthlyBudgets) {
      updated[categoryIndex].monthlyBudgets = Array(12).fill(0)
    }
    updated[categoryIndex].monthlyBudgets[monthIndex] = parseFloat(value) || 0
    setCategories(updated)
  }

  const removeCategory = async (index) => {
    if (saving) return
    setSaving(true)
    try {
      const updatedCategories = categories.filter((_, i) => i !== index)
      setCategories(updatedCategories)
      
      // Find existing budget for this year or create new one
      const existingBudget = dbYearlyBudgets?.find(b => b.year === year)
      const budgetData = {
        year,
        categories: updatedCategories,
        updatedAt: new Date().toISOString(),
        ...(existingBudget && { id: existingBudget.id })
      }
      
      await onSave(budgetData)
    } finally {
      setSaving(false)
    }
  }



  const getMonthlyBudget = (categoryName, month = currentMonth) => {
    const category = categories.find(c => c.name === categoryName)
    if (!category) return 0
    if (category.monthlyBudgets && category.monthlyBudgets[month] !== undefined) {
      return category.monthlyBudgets[month]
    }
    return category.monthlyBudget || 0
  }

  const getMonthlySpent = (categoryName, month, selectedYear = year) => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      if (transactionDate.getFullYear() !== selectedYear || t.category !== categoryName || t.expense <= 0) return false
      
      const budgetMonth = getMonthFromDateRange(transactionDate)
      return budgetMonth === month
    })
    return monthTransactions.reduce((sum, t) => sum + (t.expense || 0), 0)
  }



  const saveBudget = async () => {
    if (saving) return
    setSaving(true)
    try {
      const existingBudget = dbYearlyBudgets?.find(b => b.year === year)
      const budgetData = {
        year,
        categories,
        monthRanges,
        updatedAt: new Date().toISOString(),
        ...(existingBudget && { id: existingBudget.id })
      }
      
      console.log('💾 Saving budget:', budgetData)
      await onSave(budgetData)
      console.log('✅ Budget saved successfully')
    } catch (error) {
      console.error('❌ Budget save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const getTotalMonthlyBudget = (month = currentMonth) => {
    return categories.reduce((sum, cat) => {
      if (cat.type !== 'Expense') return sum
      if (cat.monthlyBudgets && cat.monthlyBudgets[month] !== undefined) {
        return sum + cat.monthlyBudgets[month]
      }
      return sum + (cat.monthlyBudget || 0)
    }, 0)
  }

  const getMonthlyAllocation = (month) => {
    const income = monthlyIncome[month]
    const allocated = getTotalMonthlyBudget(month)
    return { income, allocated, unallocated: income - allocated }
  }

  const getCurrentMonthSpent = () => {
    return categories.reduce((sum, cat) => sum + getMonthlySpent(cat.name, currentMonth), 0)
  }

  const getBudgetUtilization = (categoryName, month = currentMonth) => {
    const budget = getMonthlyBudget(categoryName, month)
    const spent = getMonthlySpent(categoryName, month)
    return budget > 0 ? (spent / budget) * 100 : 0
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Planner</h1>
        <div className="flex justify-center items-center gap-2 mt-4">
          <button 
            onClick={() => setYear(year - 1)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-2xl font-bold text-gray-900 dark:text-white px-4">{year}</span>
          <button 
            onClick={() => setYear(year + 1)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Monthly Income</div>
          <div className="text-2xl font-bold">₹{categories.filter(c => c.type === 'Income').reduce((sum, c) => {
            if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
              return sum + c.monthlyBudgets[currentMonth]
            }
            return sum + (c.monthlyBudget || 0)
          }, 0).toLocaleString('en-IN')}</div>
          <div className="text-xs opacity-75 mt-1">Budget for {months[currentMonth]}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Monthly Expense</div>
          <div className="text-2xl font-bold">₹{categories.filter(c => c.type === 'Expense').reduce((sum, c) => {
            if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
              return sum + c.monthlyBudgets[currentMonth]
            }
            return sum + (c.monthlyBudget || 0)
          }, 0).toLocaleString('en-IN')}</div>
          <div className="text-xs opacity-75 mt-1">Budget for {months[currentMonth]}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Monthly Asset</div>
          <div className="text-2xl font-bold">₹{categories.filter(c => c.type === 'Asset').reduce((sum, c) => {
            if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
              return sum + c.monthlyBudgets[currentMonth]
            }
            return sum + (c.monthlyBudget || 0)
          }, 0).toLocaleString('en-IN')}</div>
          <div className="text-xs opacity-75 mt-1">Budget for {months[currentMonth]}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Monthly Liability</div>
          <div className="text-2xl font-bold">₹{categories.filter(c => c.type === 'Liability').reduce((sum, c) => {
            if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
              return sum + c.monthlyBudgets[currentMonth]
            }
            return sum + (c.monthlyBudget || 0)
          }, 0).toLocaleString('en-IN')}</div>
          <div className="text-xs opacity-75 mt-1">Budget for {months[currentMonth]}</div>
        </div>
      </div>



      {/* Income & Budget Setup */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer" onClick={() => setShowSetup(!showSetup)}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Setup Your Budget</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Configure budget categories for {year}</p>
            </div>
            <div className={`transform transition-transform ${showSetup ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        {showSetup && <div className="p-6 space-y-6">
          {/* Budget Period Date Ranges */}
          <div>
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowDateRanges(!showDateRanges)}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Budget Period Date Ranges</h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div className={`transform transition-transform ${showDateRanges ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {showDateRanges && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {months.map((month, index) => (
                <div key={month} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{month} Budget Period</label>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={monthRanges[index]?.startDate || ''}
                        onChange={(e) => updateMonthRange(index, 'startDate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={monthRanges[index]?.endDate || ''}
                        onChange={(e) => updateMonthRange(index, 'endDate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>}
          </div>

          {/* Budget Allocation Status */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Budget Allocation - {months[currentMonth]}</h3>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</div>
                <div className="text-2xl font-bold text-green-600">₹{monthlyIncome[currentMonth].toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Allocated (Expenses)</div>
                <div className="text-2xl font-bold text-blue-600">₹{getTotalMonthlyBudget(currentMonth).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unallocated</div>
                <div className={`text-2xl font-bold ${getMonthlyAllocation(currentMonth).unallocated === 0 ? 'text-green-600' : getMonthlyAllocation(currentMonth).unallocated > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  ₹{Math.abs(getMonthlyAllocation(currentMonth).unallocated).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            {getMonthlyAllocation(currentMonth).unallocated !== 0 && (
              <div className={`p-3 rounded-lg ${getMonthlyAllocation(currentMonth).unallocated > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getMonthlyAllocation(currentMonth).unallocated > 0 ? '⚠️' : '❌'}</span>
                  <span className="text-sm font-semibold">
                    {getMonthlyAllocation(currentMonth).unallocated > 0 
                      ? `You have ₹${getMonthlyAllocation(currentMonth).unallocated.toLocaleString('en-IN')} unallocated. Allocate to expense categories.`
                      : `Over-allocated by ₹${Math.abs(getMonthlyAllocation(currentMonth).unallocated).toLocaleString('en-IN')}. Reduce expense budgets.`
                    }
                  </span>
                </div>
              </div>
            )}
            {getMonthlyAllocation(currentMonth).unallocated === 0 && (
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <span className="text-sm font-semibold">Perfectly balanced! All income allocated.</span>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Income - Auto-calculated from transactions */}
          <div>
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowIncome(!showIncome)}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Income - {year}</h3>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">Auto-calculated from transactions</div>
                <div className={`transform transition-transform ${showIncome ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {showIncome && <>
              <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                📊 Total transactions: {transactions.length} | Income transactions: {transactions.filter(t => t.income > 0).length}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {months.map((month, index) => (
                  <div key={month}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{month}</label>
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      ₹{monthlyIncome[index].toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </>}
          </div>

          {/* Budget Categories */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Budget Categories</h3>
              <button onClick={addCategory} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" />Add Category
              </button>
            </div>
            <div className="space-y-4">
              {categories.map((cat, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={cat.name}
                      onChange={(e) => updateCategory(index, 'name', e.target.value)}
                      className="col-span-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                    />
                    <select
                      value={cat.type}
                      onChange={(e) => updateCategory(index, 'type', e.target.value)}
                      className="col-span-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                    >
                      <option value="Asset">Asset</option>
                      <option value="Liability">Liability</option>
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                    </select>
                    <div className="col-span-4 text-sm text-gray-600 dark:text-gray-400">
                      Total: ₹{((cat.monthlyBudgets || Array(12).fill(cat.monthlyBudget || 0)).reduce((a, b) => a + b, 0)).toLocaleString('en-IN')}/year
                    </div>
                    <button 
                      onClick={() => removeCategory(index)} 
                      disabled={saving}
                      className="col-span-1 p-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {months.map((month, monthIndex) => (
                      <div key={month}>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{month}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={(cat.monthlyBudgets && cat.monthlyBudgets[monthIndex] !== undefined) ? cat.monthlyBudgets[monthIndex] : (cat.monthlyBudget || '')}
                            onChange={(e) => updateCategoryMonth(index, monthIndex, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pl-4"
                            placeholder="0"
                          />
                          <span className="absolute left-1 top-1 text-xs text-gray-500">₹</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={saveBudget} 
                disabled={saving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        </div>}
      </div>
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
                  <span className="font-semibold text-green-600">₹{categories.filter(c => c.type === 'Income').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                      return sum + c.monthlyBudgets[currentMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Passive Income (I-Quadrant)</span>
                  <span className="font-semibold text-green-600">₹{categories.filter(c => c.type === 'Asset').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                      return sum + c.monthlyBudgets[currentMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-green-200 dark:border-green-700 pt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Income</span>
                    <span className="text-green-600">₹{monthlyIncome[currentMonth].toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-4">💸 EXPENSES</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Living Expenses</span>
                  <span className="font-semibold text-red-600">₹{categories.filter(c => c.type === 'Expense').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                      return sum + c.monthlyBudgets[currentMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Liabilities (Debt Payments)</span>
                  <span className="font-semibold text-red-600">₹{categories.filter(c => c.type === 'Liability').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                      return sum + c.monthlyBudgets[currentMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-red-200 dark:border-red-700 pt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Expenses</span>
                    <span className="text-red-600">₹{(categories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                      if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                        return sum + c.monthlyBudgets[currentMonth]
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
                (monthlyIncome[currentMonth] - categories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                  if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                    return sum + c.monthlyBudgets[currentMonth]
                  }
                  return sum + (c.monthlyBudget || 0)
                }, 0)) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{Math.abs(monthlyIncome[currentMonth] - categories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                  if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                    return sum + c.monthlyBudgets[currentMonth]
                  }
                  return sum + (c.monthlyBudget || 0)
                }, 0)).toLocaleString('en-IN')}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(monthlyIncome[currentMonth] - categories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                  if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                    return sum + c.monthlyBudgets[currentMonth]
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
                  <span className="text-2xl">👨‍💼</span>
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
                  const passiveIncome = categories.filter(c => c.type === 'Asset').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                      return sum + c.monthlyBudgets[currentMonth]
                    }
                    return sum + (c.monthlyBudget || 0)
                  }, 0)
                  const totalIncome = monthlyIncome[currentMonth]
                  const passiveRatio = totalIncome > 0 ? (passiveIncome / totalIncome) * 100 : 0
                  const recommendations = []
                  
                  if (passiveRatio < 10) recommendations.push({ text: 'Focus on building passive income streams (I-Quadrant)', type: 'warning', icon: '📈' })
                  if (passiveRatio >= 10 && passiveRatio < 25) recommendations.push({ text: 'Good start! Increase passive income to 25%+', type: 'info', icon: '🎯' })
                  if (passiveRatio >= 25) recommendations.push({ text: 'Excellent! You\'re building financial freedom', type: 'success', icon: '🏆' })
                  
                  const netCashFlow = monthlyIncome[currentMonth] - categories.filter(c => c.type === 'Expense' || c.type === 'Liability').reduce((sum, c) => {
                    if (c.monthlyBudgets && c.monthlyBudgets[currentMonth] !== undefined) {
                      return sum + c.monthlyBudgets[currentMonth]
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