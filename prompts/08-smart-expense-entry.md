# Step 8: Smart Expense Entry - Mobile-First Quick Parser

## Priority: 🟡 MEDIUM

## Prompt:

```
@EnhancedExpenseManager.jsx Add MOBILE-FIRST smart quick-add:

MOBILE QUICK-ADD UI:
- Floating action button (FAB) at bottom-right
- Tap FAB → Bottom sheet with smart input
- Large input field (52px height, 18px font)
- Real-time parsing preview below input
- Voice input button (microphone icon)

SMART PARSING (Mobile-optimized):
Examples:
- "500 petrol hdfc" → ₹500, Petrol, HDFC
- "2000 groceries" → ₹2000, DMART & Oil, Cash (default)
- "1500 food card" → ₹1500, Vegetable, Card

MOBILE PARSING FEATURES:
- Show parsed values as chips below input
- Tap chip to edit individual field
- Swipe chip to remove/change
- Auto-suggest categories (horizontal scroll)
- Recent transactions quick-repeat (tap to add)

VOICE INPUT (Mobile-specific):
- "Spent 500 rupees on petrol using HDFC card"
- Use Web Speech API
- Show listening animation
- Parse voice to text to transaction

MOBILE PREVIEW:
- Show parsed transaction card
- Large "Add Expense" button (full width, 52px)
- "Edit Details" link (opens full form)
- Haptic feedback on successful add

Add this as primary entry method on mobile, above detailed form.
```

## Expected Outcome:
- 70% faster expense logging
- Natural language input
- Voice input support
- Higher completion rate

## Testing Checklist:
- [ ] Parsing works correctly
- [ ] Voice input functional
- [ ] Preview shows correctly
- [ ] Quick-repeat works
- [ ] Haptic feedback present
