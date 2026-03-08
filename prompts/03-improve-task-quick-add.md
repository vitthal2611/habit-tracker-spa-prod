# Step 3: Improve Task Quick-Add - Mobile-First Friction Reduction

## Priority: 🔴 HIGH

## Prompt:

```
@TodoList.jsx Redesign task creation for MOBILE-FIRST quick capture:

MOBILE QUICK-ADD:
- Floating action button (FAB) at bottom-right (above bottom nav)
- Tap FAB → Bottom sheet slides up with minimal form
- Single input field: task text (autofocus, 16px font)
- Smart defaults: medium priority, today's date, personal category
- "Add Task" button (full width, 52px height, prominent)
- "Add Details" link below → expands bottom sheet to show all fields

BOTTOM SHEET BEHAVIOR:
- Swipe down to dismiss
- Backdrop tap to close
- Smooth slide-up animation (300ms)
- Keyboard pushes sheet up (not covered)
- Safe area padding at bottom

EXPANDED FORM:
- Show priority buttons (3 large touch targets)
- Date picker (native mobile picker)
- Time estimate (number input with +/- buttons)
- Category chips (horizontal scroll)
- Tags input (with suggestions)
- Recurring toggle with inline options

Keep existing functionality but optimize for one-handed mobile use.
```

## Expected Outcome:
- 80% faster task capture
- Reduced friction for quick adds
- Smart defaults reduce decisions
- Advanced features still accessible

## Testing Checklist:
- [ ] FAB positioned correctly
- [ ] Bottom sheet slides smoothly
- [ ] Keyboard doesn't cover input
- [ ] Quick add works with defaults
- [ ] Expanded form shows all options
- [ ] One-handed operation
