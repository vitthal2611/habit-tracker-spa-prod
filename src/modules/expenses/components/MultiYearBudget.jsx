import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, DollarSign, Download, Settings, Plus, Minus } from 'lucide-react'

export default function MultiYearBudget({ onSave, savedPlans = [] }) {
  const [years, setYears] = useState(5)
  const [startYear, setStartYear] = useState(new Date().getFullYear())
  const [baseIncome, setBaseIncome] = useState(200000)
  const [incomeGrowth, setIncomeGrowth] = useState(10)
  const [expenseGrowth, setExpenseGrowth] = useState(8)
  
  const [categories, setCategories] = useState({
    income: [
      { name: 'Salary', amount: 200000, growth: 10 },
      { name: 'Bonus', amount: 50000, growth: 5 }
    ],
    expenses: [
      { name: 'EMI', amount: 75000, growth: 0 },
      { name: 'Groceries', amount: 15000, growth: 8 },
      { name: 'Utilities', amount: 5000, growth: 6 },
      { name: 'Education', amount: 8000, growth: 10 }
    ],
    investments: [
      { name: 'SIP', amount: 30000, growth: 15 },
      { name: 'PPF', amount: 12000, growth: 0 }
    ]
  })
  
  const [projections, setProjections] = useState([])
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    calculateProjections()
  }, [years, startYear, categories])

  const calculateProjections = () => {
    const results = []
    
    for (let year = 0; year < years; year++) {
      const currentYear = startYear + year
      
      // Calculate income for this year
      const yearIncome = categories.income.reduce((total, item) => {
        const yearAmount = item.amount * Math.pow(1 + item.growth / 100, year)
        return total + yearAmount
      }, 0)
      
      // Calculate expenses for this year
      const yearExpenses = categories.expenses.reduce((total, item) => {
        const yearAmount = item.amount * Math.pow(1 + item.growth / 100, year)
        return total + yearAmount
      }, 0)
      
      // Calculate investments for this year
      const yearInvestments = categories.investments.reduce((total, item) => {
        const yearAmount = item.amount * Math.pow(1 + item.growth / 100, year)
        return total + yearAmount
      }, 0)
      
      const yearSavings = yearIncome - yearExpenses - yearInvestments
      
      results.push({
        year: currentYear,
        income: yearIncome,
        expenses: yearExpenses,
        investments: yearInvestments,
        savings: yearSavings,
        incomeBreakdown: categories.income.map(item => ({
          name: item.name,
          amount: item.amount * Math.pow(1 + item.growth / 100, year)
        })),
        expenseBreakdown: categories.expenses.map(item => ({
          name: item.name,
          amount: item.amount * Math.pow(1 + item.growth / 100, year)
        })),
        investmentBreakdown: categories.investments.map(item => ({
          name: item.name,
          amount: item.amount * Math.pow(1 + item.growth / 100, year)
        }))
      })
    }
    
    setProjections(results)
  }

  const addCategory = (type) => {
    setCategories(prev => ({
      ...prev,
      [type]: [...prev[type], { name: '', amount: 0, growth: 0 }]
    }))
  }

  const removeCategory = (type, index) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const updateCategory = (type, index, field, value) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const exportToCSV = () => {
    let csv = 'Year,Income,Expenses,Investments,Savings\n'
    projections.forEach(p => {
      csv += `${p.year},${p.income.toFixed(0)},${p.expenses.toFixed(0)},${p.investments.toFixed(0)},${p.savings.toFixed(0)}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-plan-${startYear}-${startYear + years - 1}.csv`
    a.click()
  }

  const savePlan = () => {
    const plan = {
      id: `plan_${Date.now()}`,
      name: `Budget Plan ${startYear}-${startYear + years - 1}`,
      startYear,
      years,
      categories,
      projections,
      createdAt: new Date().toISOString()
    }
    onSave(plan)
  }

  const totalIncome = projections.reduce((sum, p) => sum + p.income, 0)
  const totalExpenses = projections.reduce((sum, p) => sum + p.expenses, 0)
  const totalInvestments = projections.reduce((sum, p) => sum + p.investments, 0)
  const totalSavings = projections.reduce((sum, p) => sum + p.savings, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Year Budget Planning</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Plan your budget for {years} years with growth projections</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />Settings
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />Export
          </button>
          <button
            onClick={savePlan}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Plan
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Planning Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Year</label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Years</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Categories Configuration */}
          {Object.entries(categories).map(([type, items]) => (
            <div key={type} className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold capitalize">{type}</h4>
                <button
                  onClick={() => addCategory(type)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />Add
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Name"
                      value={item.name}
                      onChange={(e) => updateCategory(type, index, 'name', e.target.value)}
                      className="px-2 py-1 border rounded text-sm dark:bg-gray-700"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) => updateCategory(type, index, 'amount', parseFloat(e.target.value) || 0)}
                      className="px-2 py-1 border rounded text-sm dark:bg-gray-700"
                    />
                    <input
                      type="number"
                      placeholder="Growth %"
                      value={item.growth}
                      onChange={(e) => updateCategory(type, index, 'growth', parseFloat(e.target.value) || 0)}
                      className="px-2 py-1 border rounded text-sm dark:bg-gray-700"
                    />
                    <button
                      onClick={() => removeCategory(type, index)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 mb-1">Total Income</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            ₹{(totalIncome / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            ₹{(totalExpenses / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Investments</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            ₹{(totalInvestments / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Savings</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            ₹{(totalSavings / 100000).toFixed(1)}L
          </div>
        </div>
      </div>

      {/* Yearly Projections Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Year</th>
                <th className="px-4 py-3 text-right font-semibold">Income</th>
                <th className="px-4 py-3 text-right font-semibold">Expenses</th>
                <th className="px-4 py-3 text-right font-semibold">Investments</th>
                <th className="px-4 py-3 text-right font-semibold">Savings</th>
                <th className="px-4 py-3 text-right font-semibold">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {projections.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3 font-medium">{p.year}</td>
                  <td className="px-4 py-3 text-right text-green-600">₹{(p.income / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{(p.expenses / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 text-right text-purple-600">₹{(p.investments / 1000).toFixed(0)}k</td>
                  <td className={`px-4 py-3 text-right font-semibold ${p.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ₹{(p.savings / 1000).toFixed(0)}k
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {((p.savings / p.income) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Year-wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projections.slice(0, 4).map((p, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Year {p.year}</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Income Breakdown</div>
                {p.incomeBreakdown.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-green-600">₹{(item.amount / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Major Expenses</div>
                {p.expenseBreakdown.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-red-600">₹{(item.amount / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}