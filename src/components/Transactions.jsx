import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export default function Transactions({ transactions = [], budgetCategories = [], onAdd, onDelete }) {
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    particular: '',
    category: '',
    income: 0,
    expense: 0,
    mode: 'Cash'
  })

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
            onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          >
            <option value="">Select Category</option>
            {budgetCategories.map((cat, index) => (
              <option key={index} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Income"
            value={newTransaction.income || ''}
            onChange={(e) => setNewTransaction({...newTransaction, income: e.target.value})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          />
          <input
            type="number"
            placeholder="Expense"
            value={newTransaction.expense || ''}
            onChange={(e) => setNewTransaction({...newTransaction, expense: e.target.value})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          />
          <select
            value={newTransaction.mode}
            onChange={(e) => setNewTransaction({...newTransaction, mode: e.target.value})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Bank">Bank</option>
          </select>
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
              {transactions.map((t, index) => (
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
              {transactions.length === 0 && (
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