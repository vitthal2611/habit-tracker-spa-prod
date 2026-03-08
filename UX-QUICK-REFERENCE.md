# UX Components Quick Reference

## Component Import Paths

```jsx
// UI Components
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import Toast from '../../components/ui/Toast'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Tooltip from '../../components/ui/Tooltip'

// Feature Components
import OnboardingTour from '../../components/OnboardingTour'
import KeyboardShortcuts from '../../components/KeyboardShortcuts'

// Hooks
import { useToast } from '../../hooks/useToast'
import { useKeyboardShortcut, useGlobalShortcuts } from '../../hooks/useKeyboardShortcut'
```

## Quick Usage

### Loading
```jsx
if (loading) return <Loading text="Loading data..." />
// or
<Loading text="Processing..." fullScreen />
```

### Empty State
```jsx
{items.length === 0 && (
  <EmptyState 
    type="habits" // or "todos" or "expenses"
    onAction={() => setShowForm(true)} 
    actionLabel="Get Started" 
  />
)}
```

### Toast
```jsx
const { toast, showToast, hideToast } = useToast()

showToast('Success!') // default success
showToast('Error occurred', 'error')
showToast('Info message', 'info')
showToast('Warning!', 'warning')

{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
```

### Confirm Dialog
```jsx
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleAction}
  title="Confirm Action"
  message="Are you sure?"
  confirmText="Yes"
  cancelText="No"
  type="danger" // or "warning" or "info"
/>
```

### Tooltip
```jsx
<Tooltip text="Help text here" position="top">
  <button>Hover me</button>
</Tooltip>
```

### Keyboard Shortcuts
```jsx
// Single shortcut
useKeyboardShortcut('n', () => setShowForm(true))

// With modifiers
useKeyboardShortcut('s', handleSave, { ctrl: true })

// Conditional
useKeyboardShortcut('t', openModal, { enabled: !modalOpen })

// Global shortcuts (in App.jsx)
useGlobalShortcuts(activeModule, setActiveModule, toggleDarkMode, showShortcuts)
```

### Onboarding Tour
```jsx
<OnboardingTour 
  module={activeModule} 
  onComplete={() => console.log('Tour completed')} 
/>
```

## Keyboard Shortcuts Reference

### Global
- `Ctrl/⌘ + /` - Show shortcuts
- `Ctrl/⌘ + 1` - Habits
- `Ctrl/⌘ + 2` - Todos
- `Ctrl/⌘ + 3` - Expenses
- `Ctrl/⌘ + D` - Dark mode

### Habits
- `N` - New habit
- `S` - Select mode
- `T` - Templates
- `A` - Analytics

### Todos
- `N` - New task
- `T` - Templates

### Expenses
- `N` - New transaction
- `B` - Budget view

## Accessibility Checklist

```jsx
// ✅ Button with aria-label
<button aria-label="Close modal" onClick={onClose}>
  <X />
</button>

// ✅ Navigation with roles
<nav role="navigation" aria-label="Main navigation">
  <div role="tablist">
    <button role="tab" aria-selected={active}>Tab</button>
  </div>
</nav>

// ✅ Modal with dialog role
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Title</h2>
</div>

// ✅ Minimum touch targets
className="min-w-[44px] min-h-[44px]"
```

## Animation Classes

```css
.animate-fade-in      /* 300ms fade in */
.animate-slide-up     /* 300ms slide from bottom */
.animate-scale-in     /* 200ms scale from 95% */
.animate-bounce-in    /* 500ms bounce effect */
.active:scale-95      /* Button press feedback */
```

## Responsive Patterns

```jsx
// Mobile-first spacing
className="px-4 sm:px-6 py-4 sm:py-6"

// Responsive text
className="text-sm sm:text-base"

// Hide on mobile
className="hidden sm:inline"

// Mobile-specific
className="sm:hidden"

// Touch-friendly
className="min-h-[44px] active:scale-95"
```

## Common Patterns

### Module Structure
```jsx
export default function Module() {
  const [data, { addItem, updateItem, deleteItem, loading }] = useLocalStorage('key', [])
  const { toast, showToast, hideToast } = useToast()
  
  useKeyboardShortcut('n', () => setShowForm(true))
  
  if (loading) return <Loading text="Loading..." />
  
  return (
    <div className="animate-fade-in">
      {data.length === 0 ? (
        <EmptyState type="module" onAction={handleAdd} />
      ) : (
        <DataList data={data} />
      )}
      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  )
}
```

### Form with Confirmation
```jsx
const [showConfirm, setShowConfirm] = useState(false)

const handleDelete = () => setShowConfirm(true)

const confirmDelete = async () => {
  await deleteItem(id)
  showToast('Deleted successfully!')
  setShowConfirm(false)
}

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={confirmDelete}
  title="Delete Item?"
  message="This cannot be undone."
  type="danger"
/>
```

## Best Practices

1. **Always provide loading states** for async operations
2. **Use empty states** instead of blank screens
3. **Show toast notifications** for all CRUD operations
4. **Add confirmation dialogs** for destructive actions
5. **Include tooltips** for complex features
6. **Implement keyboard shortcuts** for power users
7. **Ensure minimum 44px touch targets** on mobile
8. **Add ARIA labels** to all interactive elements
9. **Use semantic HTML** (nav, main, section, etc.)
10. **Test with keyboard-only navigation**

## Testing Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

**Keyboard shortcuts not working?**
- Check if modal/form is open (shortcuts disabled)
- Verify `enabled` prop in useKeyboardShortcut
- Check for conflicting browser shortcuts

**Toast not dismissing?**
- Ensure `hideToast` is called in onClose
- Check timeout duration (default 3000ms)

**Modal focus trap issues?**
- Verify focusable elements exist
- Check tab order with keyboard
- Ensure modal has proper ARIA attributes

**Empty state not showing?**
- Verify data array length check
- Check conditional rendering logic
- Ensure EmptyState type matches module

## Performance Tips

1. Use `useCallback` for event handlers passed to children
2. Memoize expensive computations with `useMemo`
3. Lazy load heavy components
4. Debounce keyboard shortcuts if needed
5. Optimize re-renders with React.memo
6. Use CSS transforms for animations (not position/size)
7. Minimize localStorage reads/writes
8. Batch state updates when possible

## Browser DevTools

**Check Accessibility:**
- Chrome: Lighthouse > Accessibility
- Firefox: Accessibility Inspector
- Edge: Accessibility Insights

**Test Keyboard Navigation:**
- Tab through all interactive elements
- Verify focus indicators visible
- Test shortcuts in each module

**Mobile Testing:**
- Chrome DevTools > Device Mode
- Test touch targets (44x44px minimum)
- Verify responsive breakpoints
