import { useState } from 'react'
import { Plus, X, Bell, Calendar } from 'lucide-react'

export default function BillReminders({ bills, onSave }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', dueDay: 1, category: 'Bills' })

  const addBill = () => {
    if (form.name && form.amount) {
      onSave([...bills, { ...form, id: Date.now() }])
      setForm({ name: '', amount: '', dueDay: 1, category: 'Bills' })
      setShowForm(false)
    }
  }

  const deleteBill = (id) => {
    onSave(bills.filter(b => b.id !== id))
  }

  const getUpcomingBills = () => {
    const today = new Date().getDate()
    return bills.filter(b => b.dueDay >= today).sort((a, b) => a.dueDay - b.dueDay)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bill Reminders</h3>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" />Add Bill
        </button>
      </div>
      <div className="space-y-3">
        {getUpcomingBills().map(bill => (
          <div key={bill.id} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{bill.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Due: Day {bill.dueDay} • ₹{bill.amount}</p>
            </div>
            <button onClick={() => deleteBill(bill.id)} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Bill Reminder</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Bill name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <input type="number" placeholder="Due day (1-31)" min="1" max="31" value={form.dueDay} onChange={(e) => setForm({...form, dueDay: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={addBill} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
