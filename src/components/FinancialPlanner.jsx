import { useState, useEffect } from 'react'
import { Plus, Download, Upload, TrendingUp, Calculator } from 'lucide-react'

export default function FinancialPlanner({ planData, onSave }) {
  const [plan, setPlan] = useState(planData || {
    startMonth: 'Nov-25',
    salaryIncrement: 10,
    expenseInflation: 10,
    initialSalary: 200000,
    categories: {
      income: [
        { name: 'Salary', amount: 200000 },
        { name: 'VPAY', amount: 0, months: [4, 16, 28, 40, 52] }
      ],
      expense: [
        { name: 'EMI', amount: 75000 },
        { name: 'DMART & Oil', amount: 7800 },
        { name: 'Milk', amount: 2500 },
        { name: 'Gas', amount: 400 },
        { name: 'Water', amount: 250 },
        { name: 'Electricity', amount: 1500 },
        { name: 'Bai', amount: 3800 },
        { name: 'Petrol', amount: 5000 },
        { name: 'Baby-School', amount: 0, startMonth: 44 },
        { name: 'School', amount: 5000 },
        { name: 'Vegetable', amount: 5000 },
        { name: 'Med-Amruta', amount: 12000, skipMonths: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
        { name: 'Med-Insurance', amount: 7000 },
        { name: 'Vacation', amount: 16500 }
      ],
      sip: [
        { name: 'Wife SIP', amount: 20000 },
        { name: 'SSY', amount: 4000 },
        { name: 'Baby SIP', amount: 0, startMonth: 5 },
        { name: 'My SIP', amount: 20000 }
      ]
    },
    months: 60
  })

  const [projections, setProjections] = useState([])
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (plan) calculateProjections()
  }, [plan])

  const calculateProjections = () => {
    if (!plan?.categories) return
    const results = []
    let runningBalance = 0
    let currentSalary = plan.initialSalary || 200000
    let currentExpenses = [...(plan.categories.expense || [])]

    for (let month = 1; month <= plan.months; month++) {
      // Calculate salary increment every 12 months starting from month 5
      if (month > 1 && (month - 5) % 12 === 0 && month >= 5) {
        currentSalary = currentSalary * (1 + plan.salaryIncrement / 100)
        currentExpenses = currentExpenses.map(cat => ({
          ...cat,
          amount: cat.amount * (1 + plan.expenseInflation / 100)
        }))
      }

      // Calculate income
      let totalIncome = currentSalary
      plan.categories.income.forEach(cat => {
        if (cat.name === 'VPAY' && cat.months?.includes(month)) {
          totalIncome += 250000
        }
      })

      // Calculate expenses
      let totalExpense = 0
      currentExpenses.forEach(cat => {
        if (cat.startMonth && month < cat.startMonth) return
        if (cat.skipMonths?.includes(month)) return
        totalExpense += cat.amount
      })

      // Calculate SIP
      let totalSIP = 0
      plan.categories.sip.forEach(cat => {
        if (cat.startMonth && month < cat.startMonth) return
        if (cat.name === 'Baby SIP' && month >= 5) {
          totalSIP += 5000
        } else {
          totalSIP += cat.amount
        }
      })

      const monthBalance = totalIncome - totalExpense - totalSIP
      runningBalance += monthBalance

      results.push({
        month,
        monthName: getMonthName(month, plan.startMonth),
        salary: currentSalary,
        vpay: plan.categories.income.find(c => c.name === 'VPAY')?.months?.includes(month) ? 250000 : 0,
        totalIncome,
        expenses: currentExpenses.map(cat => ({
          name: cat.name,
          amount: (cat.startMonth && month < cat.startMonth) || cat.skipMonths?.includes(month) ? 0 : cat.amount
        })),
        totalExpense,
        sips: plan.categories.sip.map(cat => ({
          name: cat.name,
          amount: (cat.startMonth && month < cat.startMonth) ? 0 : 
                  (cat.name === 'Baby SIP' && month >= 5) ? 5000 : cat.amount
        })),
        totalSIP,
        monthBalance,
        runningBalance
      })
    }

    setProjections(results)
  }

  const getMonthName = (monthNum, startMonth) => {
    const [startMonthName, startYear] = startMonth.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const startIdx = months.indexOf(startMonthName)
    const year = parseInt('20' + startYear)
    
    const totalMonths = startIdx + monthNum - 1
    const newMonthIdx = totalMonths % 12
    const newYear = year + Math.floor(totalMonths / 12)
    
    return `${months[newMonthIdx]}-${newYear.toString().slice(-2)}`
  }

  const exportToCSV = () => {
    let csv = 'Month,Salary,VPAY,Total Income,Total Expense,Total SIP,Balance,Running Balance\n'
    projections.forEach(p => {
      csv += `${p.monthName},${p.salary},${p.vpay},${p.totalIncome},${p.totalExpense},${p.totalSIP},${p.monthBalance},${p.runningBalance}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'financial-plan.csv'
    a.click()
  }

  const savePlan = () => {
    onSave(plan)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Planning</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Multi-year projection with increments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />Settings
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />Export CSV
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Plan Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Month</label>
              <input
                type="text"
                value={plan.startMonth}
                onChange={(e) => setPlan({ ...plan, startMonth: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                placeholder="Nov-25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Initial Salary</label>
              <input
                type="number"
                value={plan.initialSalary}
                onChange={(e) => setPlan({ ...plan, initialSalary: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Salary Increment (%)</label>
              <input
                type="number"
                value={plan.salaryIncrement}
                onChange={(e) => setPlan({ ...plan, salaryIncrement: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expense Inflation (%)</label>
              <input
                type="number"
                value={plan.expenseInflation}
                onChange={(e) => setPlan({ ...plan, expenseInflation: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Planning Months</label>
              <input
                type="number"
                value={plan.months}
                onChange={(e) => setPlan({ ...plan, months: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
          </div>
          <button
            onClick={savePlan}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Income</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            ₹{(projections.reduce((sum, p) => sum + p.totalIncome, 0) / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400 mb-1">Total Expense</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            ₹{(projections.reduce((sum, p) => sum + p.totalExpense, 0) / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total SIP</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            ₹{(projections.reduce((sum, p) => sum + p.totalSIP, 0) / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 mb-1">Final Balance</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            ₹{(projections[projections.length - 1]?.runningBalance / 100000).toFixed(1)}L
          </div>
        </div>
      </div>

      {/* Projections Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Month</th>
                <th className="px-4 py-3 text-right font-semibold">Salary</th>
                <th className="px-4 py-3 text-right font-semibold">VPAY</th>
                <th className="px-4 py-3 text-right font-semibold">Income</th>
                <th className="px-4 py-3 text-right font-semibold">Expense</th>
                <th className="px-4 py-3 text-right font-semibold">SIP</th>
                <th className="px-4 py-3 text-right font-semibold">Balance</th>
                <th className="px-4 py-3 text-right font-semibold">Running</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {projections.map((p, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${p.vpay > 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''} ${(p.month - 5) % 12 === 0 && p.month >= 5 ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                  <td className="px-4 py-3 font-medium">{p.monthName}</td>
                  <td className="px-4 py-3 text-right">₹{(p.salary / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 text-right">{p.vpay > 0 ? `₹${(p.vpay / 1000).toFixed(0)}k` : '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">₹{(p.totalIncome / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{(p.totalExpense / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 text-right text-purple-600">₹{(p.totalSIP / 1000).toFixed(0)}k</td>
                  <td className={`px-4 py-3 text-right font-semibold ${p.monthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(p.monthBalance / 1000).toFixed(0)}k
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">₹{(p.runningBalance / 1000).toFixed(0)}k</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Yearly Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(year => {
            const yearData = projections.slice((year - 1) * 12, year * 12)
            if (yearData.length === 0) return null
            
            const yearIncome = yearData.reduce((sum, p) => sum + p.totalIncome, 0)
            const yearExpense = yearData.reduce((sum, p) => sum + p.totalExpense, 0)
            const yearSIP = yearData.reduce((sum, p) => sum + p.totalSIP, 0)
            const yearSavings = yearIncome - yearExpense - yearSIP
            
            return (
              <div key={year} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Year {year}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Income:</span>
                    <span className="font-semibold text-green-600">₹{(yearIncome / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expense:</span>
                    <span className="font-semibold text-red-600">₹{(yearExpense / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">SIP:</span>
                    <span className="font-semibold text-purple-600">₹{(yearSIP / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-700">
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">Savings:</span>
                    <span className="font-bold text-blue-600">₹{(yearSavings / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
