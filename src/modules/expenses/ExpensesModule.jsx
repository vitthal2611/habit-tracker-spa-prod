import { useState } from 'react'
import EnhancedExpenseManager from './components/EnhancedExpenseManager'
import EnhancedDashboard from './components/EnhancedDashboard'
import YearlyBudget from './components/YearlyBudget'
import Transactions from './components/Transactions'
import Dashboard from './components/Dashboard'
import BillReminders from './components/BillReminders'
import SplitExpense from './components/SplitExpense'
import FinancialGoals from './components/FinancialGoals'
import CurrencySelector from './components/CurrencySelector'
import Loading from '../../components/ui/Loading'
import Toast from '../../components/ui/Toast'
import Tooltip from '../../components/ui/Tooltip'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { DEFAULT_BUDGET_CATEGORIES } from '../../utils/budgetCategories'
import { Users } from 'lucide-react'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function ExpensesModule() {
  const [dbYearlyBudgets, { addItem: addYearlyBudgetToDb, updateItem: updateYearlyBudgetInDb, loading: budgetLoading }] = useLocalStorage('yearlyBudgets', [])
  const [dbTransactions, { addItem: addTransactionToDb, updateItem: updateTransactionInDb, deleteItem: deleteTransactionFromDb, loading: transactionLoading }] = useLocalStorage('transactions', [])
  const [dbSettings, { addItem: addSettingToDb, updateItem: updateSettingInDb }] = useLocalStorage('settings', [])
  const [dbSavingsGoals, { addItem: addSavingsGoalToDb, updateItem: updateSavingsGoalInDb, deleteItem: deleteSavingsGoalFromDb }] = useLocalStorage('savingsGoals', [])
  const [dbRecurringTemplates, { addItem: addRecurringTemplateToDb, updateItem: updateRecurringTemplateInDb, deleteItem: deleteRecurringTemplateFromDb }] = useLocalStorage('recurringTemplates', [])
  const [dbBills, { addItem: addBillToDb, updateItem: updateBillInDb }] = useLocalStorage('bills', [])
  const [dbGoals, { addItem: addGoalToDb, updateItem: updateGoalInDb }] = useLocalStorage('financialGoals', [])
  const [dbCurrency, { updateItem: updateCurrency }] = useLocalStorage('currency', [{ id: 'main', code: 'INR' }])
  const [showSplitExpense, setShowSplitExpense] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  // Keyboard shortcuts
  useKeyboardShortcut('n', () => document.querySelector('[data-add-expense]')?.click(), { enabled: !showSplitExpense })
  useKeyboardShortcut('b', () => document.querySelector('[data-budget-view]')?.scrollIntoView({ behavior: 'smooth' }))

  const currency = dbCurrency[0]?.code || 'INR'
  const currentYear = new Date().getFullYear()
  const currentYearBudget = dbYearlyBudgets.find(b => b.year === currentYear)
  const paymentModes = dbSettings.find(s => s.id === 'paymentModes')?.modes || ['Cash', 'Card', 'UPI', 'Bank']
  const initialBalances = dbSettings.find(s => s.id === 'initialBalances')?.balances || {}

  if (budgetLoading || transactionLoading) return <Loading text="Loading expenses..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 px-4 flex-wrap">
        <CurrencySelector selected={currency} onSelect={(code) => {
          updateCurrency({ id: 'main', code })
          showToast('Currency updated!')
        }} />
        <Tooltip text="Split expense among multiple people">
          <button onClick={() => setShowSplitExpense(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2" aria-label="Split expense">
            <Users className="w-5 h-5" />Split Expense
          </button>
        </Tooltip>
      </div>
      <BillReminders bills={dbBills} onSave={updateBillInDb} />
      <FinancialGoals goals={dbGoals} onSave={updateGoalInDb} transactions={dbTransactions} />
      <EnhancedExpenseManager
        transactions={dbTransactions}
        onAddTransaction={async (txn) => {
          await addTransactionToDb(txn)
          showToast('Transaction added!')
        }}
        budgets={dbYearlyBudgets.reduce((acc, b) => {
          b.categories?.forEach(cat => {
            const monthKey = `${months[new Date().getMonth()]} ${b.year}`
            if (!acc[monthKey]) acc[monthKey] = []
            acc[monthKey].push(cat)
          })
          return acc
        }, {})}
        savingsGoals={dbSavingsGoals}
        onSaveGoals={async (goals) => {
          for (const goal of goals) {
            const existing = dbSavingsGoals.find(g => g.id === goal.id)
            if (existing) {
              await updateSavingsGoalInDb(goal)
            } else {
              await addSavingsGoalToDb(goal)
            }
          }
        }}
        recurringTemplates={dbRecurringTemplates}
        onSaveTemplates={async (templates) => {
          for (const template of templates) {
            const existing = dbRecurringTemplates.find(t => t.id === template.id)
            if (existing) {
              await updateRecurringTemplateInDb(template)
            } else {
              await addRecurringTemplateToDb(template)
            }
          }
        }}
      />
      <EnhancedDashboard
        transactions={dbTransactions}
        budgetCategories={currentYearBudget?.categories || DEFAULT_BUDGET_CATEGORIES}
        year={currentYear}
        modes={paymentModes}
      />
      <YearlyBudget
        budgetData={currentYearBudget}
        transactions={dbTransactions}
        dbYearlyBudgets={dbYearlyBudgets}
        onSave={async (budget) => {
          try {
            const budgetData = {
              ...budget,
              year: budget.year || currentYear,
              categories: budget.categories || [],
              updatedAt: new Date().toISOString()
            }
            const existingBudget = dbYearlyBudgets.find(b => b.year === budgetData.year)
            if (existingBudget) {
              await updateYearlyBudgetInDb({ ...budgetData, id: existingBudget.id })
            } else {
              await addYearlyBudgetToDb({ ...budgetData, id: `budget_${budgetData.year}`, createdAt: new Date().toISOString() })
            }
            showToast(`Budget saved for ${budgetData.year}!`)
          } catch (error) {
            showToast(`Failed to save budget: ${error.message}`, 'error')
          }
        }}
      />
      <Transactions
        transactions={dbTransactions}
        budgetCategories={currentYearBudget?.categories || DEFAULT_BUDGET_CATEGORIES}
        year={currentYear}
        modes={paymentModes}
        initialBalances={initialBalances}
        onUpdateModes={async (modes) => {
          const existing = dbSettings.find(s => s.id === 'paymentModes')
          if (existing) {
            await updateSettingInDb({ id: 'paymentModes', modes })
          } else {
            await addSettingToDb({ id: 'paymentModes', modes })
          }
        }}
        onUpdateBalances={async (balances) => {
          const existing = dbSettings.find(s => s.id === 'initialBalances')
          if (existing) {
            await updateSettingInDb({ id: 'initialBalances', balances })
          } else {
            await addSettingToDb({ id: 'initialBalances', balances })
          }
        }}
        onAdd={(transaction) => {
          addTransactionToDb(transaction)
          showToast('Transaction added!')
        }}
        onUpdate={(transaction) => {
          updateTransactionInDb(transaction)
          showToast('Transaction updated!')
        }}
        onDelete={(id) => {
          deleteTransactionFromDb(id)
          showToast('Transaction deleted!')
        }}
      />
      <Dashboard
        transactions={dbTransactions}
        budgetCategories={currentYearBudget?.categories || DEFAULT_BUDGET_CATEGORIES}
        year={currentYear}
      />
      {showSplitExpense && (
        <SplitExpense onAdd={async (expense) => {
          await addTransactionToDb({ ...expense, type: 'expense', mode: 'Cash', createdAt: new Date().toISOString() })
          showToast('Split expense added!')
          setShowSplitExpense(false)
        }} onClose={() => setShowSplitExpense(false)} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
