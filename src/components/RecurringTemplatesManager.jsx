import { useState } from 'react'
import { Repeat, Plus, Trash2, Play } from 'lucide-react'

export default function RecurringTemplatesManager({ templates = [], onSave, onDelete, onApply, categories = [] }) {
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    frequency: 'monthly',
    transactions: []
  })
  const [newTransaction, setNewTransaction] = useState({
    category: '',
    amount: 0,
    description: '',
    type: 'expense',
    mode: 'Cash'
  })

  const frequencies = ['daily', 'weekly', 'monthly', 'yearly']

  const addTransactionToTemplate = () => {
    if (!newTransaction.category || !newTransaction.amount) return
    
    setNewTemplate({
      ...newTemplate,
      transactions: [...newTemplate.transactions, { ...newTransaction }]
    })
    setNewTransaction({
      category: '',
      amount: 0,
      description: '',
      type: 'expense',
      mode: 'Cash'
    })
  }

  const removeTransactionFromTemplate = (index) => {
    setNewTemplate({
      ...newTemplate,
      transactions: newTemplate.transactions.filter((_, i) => i !== index)
    })
  }

  const saveTemplate = () => {
    if (!newTemplate.name || newTemplate.transactions.length === 0) return
    
    const template = {
      ...newTemplate,
      id: `template_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    onSave([...templates, template])
    setNewTemplate({ name: '', frequency: 'monthly', transactions: [] })
    setShowAddTemplate(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Repeat className="w-6 h-6" />
            Recurring Templates
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quick entry for recurring expenses</p>
        </div>
        <button
          onClick={() => setShowAddTemplate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => {
          const totalAmount = template.transactions.reduce((sum, t) => sum + t.amount, 0)
          
          return (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{template.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded capitalize">
                    {template.frequency}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(template.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {template.transactions.length} transaction{template.transactions.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  ₹{totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
                {template.transactions.map((txn, i) => (
                  <div key={i} className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{txn.category}</span>
                      <span className={txn.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        ₹{txn.amount.toLocaleString()}
                      </span>
                    </div>
                    {txn.description && (
                      <div className="text-gray-500 truncate">{txn.description}</div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onApply(template)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Apply Template
              </button>
            </div>
          )
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Repeat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Templates Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create templates for recurring expenses</p>
          <button
            onClick={() => setShowAddTemplate(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Template
          </button>
        </div>
      )}

      {/* Add Template Modal */}
      {showAddTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create Recurring Template</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Template Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Monthly Bills"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    value={newTemplate.frequency}
                    onChange={(e) => setNewTemplate({ ...newTemplate, frequency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {frequencies.map(freq => (
                      <option key={freq} value={freq} className="capitalize">{freq}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions in Template */}
            {newTemplate.transactions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Transactions ({newTemplate.transactions.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {newTemplate.transactions.map((txn, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div>
                        <div className="font-medium">{txn.category}</div>
                        <div className="text-sm text-gray-600">{txn.description}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{txn.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeTransactionFromTemplate(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Transaction Form */}
            <div className="border-t pt-4 mb-6">
              <h4 className="font-semibold mb-3">Add Transaction</h4>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border rounded-lg text-sm"
                  placeholder="Amount"
                />
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm"
                  placeholder="Description"
                />
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <button
                onClick={addTransactionToTemplate}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Template
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddTemplate(false)
                  setNewTemplate({ name: '', frequency: 'monthly', transactions: [] })
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
