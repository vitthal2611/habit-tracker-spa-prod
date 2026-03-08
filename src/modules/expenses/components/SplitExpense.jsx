import { useState } from 'react'
import { Plus, X, Users } from 'lucide-react'

export default function SplitExpense({ onAdd, onClose }) {
  const [form, setForm] = useState({ description: '', amount: '', category: 'Food', people: [''] })

  const addPerson = () => setForm({...form, people: [...form.people, '']})
  const removePerson = (i) => setForm({...form, people: form.people.filter((_, idx) => idx !== i)})
  const updatePerson = (i, name) => {
    const updated = [...form.people]
    updated[i] = name
    setForm({...form, people: updated})
  }

  const handleSubmit = () => {
    const validPeople = form.people.filter(p => p.trim())
    if (form.description && form.amount && validPeople.length > 0) {
      const splitAmount = (parseFloat(form.amount) / validPeople.length).toFixed(2)
      onAdd({
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        splitWith: validPeople,
        splitAmount: parseFloat(splitAmount),
        date: new Date().toISOString().split('T')[0],
        id: `split_${Date.now()}`
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Split Expense</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-3">
          <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          <input type="number" placeholder="Total amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Split with:</label>
            {form.people.map((person, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" placeholder="Person name" value={person} onChange={(e) => updatePerson(i, e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                {form.people.length > 1 && (
                  <button onClick={() => removePerson(i)} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addPerson} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 font-semibold flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />Add Person
            </button>
          </div>
          {form.amount && form.people.filter(p => p.trim()).length > 0 && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Each person pays:</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹{(parseFloat(form.amount) / form.people.filter(p => p.trim()).length).toFixed(2)}
              </p>
            </div>
          )}
          <button onClick={handleSubmit} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">
            Split Expense
          </button>
        </div>
      </div>
    </div>
  )
}
