# Step 15: Internationalization - Mobile-First Multi-Currency & Language

## Priority: 🟢 LOW

## Prompt Part A - Mobile-First Currency Support:

```
Create src/utils/currency.js with MOBILE-OPTIMIZED currency:

MOBILE CURRENCY FEATURES:
- Currency selector: Bottom sheet with search
- Large currency cards (80px height)
- Flag icons for visual recognition
- Recent currencies at top
- Popular currencies section

SUPPORTED CURRENCIES:
- USD ($), EUR (€), GBP (£), INR (₹), JPY (¥)
- AUD, CAD, CNY, BRL, MXN, etc.

MOBILE FORMATTER:
- Compact notation for large numbers (1.2K, 1.2M)
- Respect device locale settings
- Right-to-left support for Arabic
- Symbol position based on locale

IMPLEMENTATION:
export const formatCurrency = (amount, currency = 'INR', compact = false) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    notation: compact && amount > 9999 ? 'compact' : 'standard',
    maximumFractionDigits: 0
  }).format(amount)
}

Update @EnhancedExpenseManager.jsx to use this utility.
Add currency selector in settings (bottom sheet on mobile).
```

## Prompt Part B - Mobile-First Date Localization:

```
Create src/utils/dateFormatter.js with MOBILE-OPTIMIZED dates:

MOBILE DATE FORMATS:
- Compact: "Today", "Yesterday", "2d ago"
- Short: "Jan 15", "Dec 31"
- Long: "January 15, 2024"
- Relative: "in 2 days", "3 hours ago"

MOBILE CONSIDERATIONS:
- Use short formats (save screen space)
- Respect device locale (US: MM/DD, EU: DD/MM)
- Show relative dates for recent items
- Use native date pickers (not custom)

IMPLEMENTATION:
export const formatDate = (date, format = 'compact') => {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  
  if (format === 'compact') {
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
  }
  
  return d.toLocaleDateString('en', { 
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
    year: format === 'long' ? 'numeric' : undefined
  })
}

Replace all date formatting with this utility.
Optimize for mobile screen space (use compact by default).
```

## Expected Outcome:
- Global usability
- Multi-currency support
- Locale-aware formatting
- Mobile-optimized display

## Testing Checklist:
- [ ] Currency selector works
- [ ] Formatting respects locale
- [ ] Date formats correct
- [ ] RTL support works
- [ ] Compact notation works
