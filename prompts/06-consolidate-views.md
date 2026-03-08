# Step 6: Consolidate Views - Mobile-First Navigation

## Priority: 🟡 MEDIUM

## Prompt:

```
@HabitsModule.jsx Simplify for MOBILE NAVIGATION:

MOBILE VIEW STRATEGY:
- Remove 'table' view (not mobile-friendly)
- Keep 3 views: 'today' (default), 'weekly', 'scorecard'
- Use horizontal swipe gestures to switch views
- Add swipe indicators (dots at bottom)
- Implement view persistence (remember last view)

MOBILE VIEW SELECTOR:
- Segmented control (iOS style) instead of buttons
- Full width, sticky at top
- Large touch targets (48px height)
- Active view highlighted with bold text
- Smooth slide animation between views

GESTURE SUPPORT:
- Swipe left/right to change views
- Pull down to refresh current view
- Long press for view options

Remove HabitTableView usage. Optimize remaining views for mobile gestures.
```

## Expected Outcome:
- 50% reduction in navigation complexity
- Clearer mental model
- Gesture-based navigation
- Faster view switching

## Testing Checklist:
- [ ] Table view removed
- [ ] Swipe gestures work
- [ ] View persistence works
- [ ] Smooth animations
- [ ] Touch targets adequate
