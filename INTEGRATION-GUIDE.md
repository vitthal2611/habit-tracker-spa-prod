# Component Integration Guide

## Phase 1 Components - Integration Instructions

### 1. Envelope Budgeting Integration

#### Step 1: Add to ExpenseManager State
```javascript
// In ExpenseManager.jsx
const [showIncomeWizard, setShowIncomeWizard] = useState(false)
const [envelopeBudgets, setEnvelopeBudgets] = useState(() => {
  const saved = localStorage.getItem('envelopeBudgets')
  return saved ? JSON.parse(saved) : []
})

useEffect(() => {
  localStorage.setItem('envelopeBudgets', JSON.stringify(envelopeBudgets))
}, [envelopeBudgets])
```

#### Step 2: Add Button to UI
```javascript
// Add near top of ExpenseManager, after "Categories" button
<button
  onClick={() => setShowIncomeWizard(true)}
  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
>
  💰 Allocate Income
</button>
```

#### Step 3: Add Wizard Component
```javascript
// Import at top
import IncomeAllocationWizard from './components/IncomeAllocationWizard'
import EnvelopeCard from './components/EnvelopeCard'

// Add before closing div
{showIncomeWizard && (
  <IncomeAllocationWizard
    month={currentMonthKey}
    onComplete={(budget) => {
      setEnvelopeBudgets([...envelopeBudgets, budget])
      setShowIncomeWizard(false)
    }}
    onClose={() => setShowIncomeWizard(false)}
  />
)}
```

#### Step 4: Display Envelope Cards
```javascript
// Add after stats cards, before transactions table
{envelopeBudgets.find(b => b.month === currentMonthKey) && (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
    <h3 className="text-lg font-bold mb-4">Budget Envelopes</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {envelopeBudgets
        .find(b => b.month === currentMonthKey)
        ?.envelopes.map(envelope => (
          <EnvelopeCard key={envelope.id} envelope={envelope} />
        ))}
    </div>
  </div>
)}
```

#### Step 5: Update Envelope on Transaction
```javascript
// In handleAddTransaction, after successful add
const currentBudget = envelopeBudgets.find(b => b.month === currentMonthKey)
if (currentBudget && transactionForm.type === 'expense') {
  const envelope = currentBudget.envelopes.find(e => 
    e.name.toLowerCase() === transactionForm.category.toLowerCase()
  )
  if (envelope) {
    envelope.spent += amount
    envelope.remaining = envelope.allocated - envelope.spent
    setEnvelopeBudgets([...envelopeBudgets])
  }
}
```

---

### 2. Payment Mode Tracking Integration

#### Step 1: Add to ExpenseManager State
```javascript
// In ExpenseManager.jsx
const [showPaymentModes, setShowPaymentModes] = useState(false)
const [paymentModes, setPaymentModes] = useState(() => {
  const saved = localStorage.getItem('paymentModes')
  return saved ? JSON.parse(saved) : [
    { id: 'pm_1', name: 'HDFC Bank', balance: 25000, type: 'bank' },
    { id: 'pm_2', name: 'Cash', balance: 5000, type: 'cash' },
    { id: 'pm_3', name: 'SBI Credit Card', balance: -8000, type: 'credit', limit: 50000 }
  ]
})

useEffect(() => {
  localStorage.setItem('paymentModes', JSON.stringify(paymentModes))
}, [paymentModes])
```

#### Step 2: Add Button to UI
```javascript
// Add near "Allocate Income" button
<button
  onClick={() => setShowPaymentModes(true)}
  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
>
  💳 Payment Modes
</button>
```

#### Step 3: Add Manager Component
```javascript
// Import at top
import PaymentModeManager from './components/PaymentModeManager'
import PaymentModeCard from './components/PaymentModeCard'

// Add before closing div
{showPaymentModes && (
  <PaymentModeManager
    modes={paymentModes}
    onSave={(modes) => {
      setPaymentModes(modes)
      setShowPaymentModes(false)
    }}
    onClose={() => setShowPaymentModes(false)}
  />
)}
```

#### Step 4: Display Payment Mode Cards
```javascript
// Add after envelope cards or stats
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
  <h3 className="text-lg font-bold mb-4">Payment Modes</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {paymentModes.map(mode => (
      <PaymentModeCard key={mode.id} mode={mode} />
    ))}
  </div>
</div>
```

#### Step 5: Update Balance on Transaction
```javascript
// In handleAddTransaction, after successful add
const mode = paymentModes.find(m => m.name === transactionForm.mode)
if (mode) {
  if (transactionForm.type === 'income') {
    mode.balance += amount
  } else {
    // Check sufficient balance for non-credit modes
    if (mode.type !== 'credit' && mode.balance < amount) {
      alert(`Insufficient balance in ${mode.name}!`)
      return
    }
    mode.balance -= amount
  }
  setPaymentModes([...paymentModes])
}
```

#### Step 6: Add Transfer Transaction Type
```javascript
// In transaction form, add new type option
<button 
  onClick={() => { 
    setTransactionForm({ ...transactionForm, type: 'transfer' }); 
    setFormStep(1); 
  }} 
  className="px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 font-semibold"
>
  Transfer
</button>

// Add transfer handling
if (transactionForm.type === 'transfer') {
  // Show "From" and "To" mode selectors
  // Deduct from source, add to destination
}
```

---

### 3. Bottom Navigation - Already Integrated! ✅

The bottom navigation is already integrated in App.jsx and will automatically show on mobile devices (<768px width).

**Features:**
- Responsive: Bottom nav on mobile, top nav on desktop
- Haptic feedback on tab change
- iOS safe area support
- Smooth animations

**Tab Mapping:**
- `habits` → Habits Module
- `tasks` → Todos Module  
- `money` → Expenses Module
- `stats` → Stats Module (placeholder)

---

## Quick Start Checklist

### Envelope Budgeting
- [ ] Add state and localStorage
- [ ] Add "Allocate Income" button
- [ ] Import and add IncomeAllocationWizard
- [ ] Import and display EnvelopeCard components
- [ ] Update envelope.spent on transactions

### Payment Mode Tracking
- [ ] Add state and localStorage
- [ ] Add "Payment Modes" button
- [ ] Import and add PaymentModeManager
- [ ] Import and display PaymentModeCard components
- [ ] Update mode.balance on transactions
- [ ] Add balance validation
- [ ] (Optional) Add transfer transaction type

### Bottom Navigation
- [x] Already integrated!
- [ ] Test on mobile device
- [ ] Test haptic feedback
- [ ] Test iOS safe area

---

## Data Structures

### Envelope Budget
```javascript
{
  month: "Nov 2024",
  income: 50000,
  allocated: 45000,
  unallocated: 5000,
  envelopes: [
    {
      id: "env_123",
      name: "Rent",
      allocated: 15000,
      spent: 0,
      remaining: 15000,
      category: "essentials"
    }
  ]
}
```

### Payment Mode
```javascript
{
  id: "pm_123",
  name: "HDFC Bank",
  balance: 25000,
  type: "bank" | "cash" | "credit",
  limit: 50000 // only for credit cards
}
```

---

## Testing

1. **Envelope Budgeting:**
   - Open wizard, complete all 5 steps
   - Verify envelopes display correctly
   - Add expense, verify envelope.spent updates
   - Check over-budget warning appears

2. **Payment Mode Tracking:**
   - Open manager, add/edit/delete modes
   - Verify cards display with correct balances
   - Add transaction, verify balance updates
   - Test insufficient balance warning

3. **Bottom Navigation:**
   - Resize browser to <768px
   - Verify bottom nav appears
   - Click all tabs, verify navigation works
   - Test on actual mobile device

---

## Notes

- All components use localStorage for persistence
- Components are fully styled with dark mode support
- All components are responsive and mobile-friendly
- Haptic feedback requires browser support (navigator.vibrate)

---

Last Updated: 2024
