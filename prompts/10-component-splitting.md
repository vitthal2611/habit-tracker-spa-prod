# Step 10: Component Splitting - Mobile-First Architecture

## Priority: 🟡 MEDIUM

## Prompt Part A - Split TodoList:

```
@TodoList.jsx Split into MOBILE-OPTIMIZED components:

CREATE THESE FILES:
1. TodoFilters.jsx (Mobile-first filters):
   - Bottom sheet filter panel
   - Large filter chips (48px height)
   - Horizontal scroll for categories
   - Apply/Clear buttons (full width)

2. TodoForm.jsx (Mobile-first form):
   - Bottom sheet form
   - Progressive disclosure
   - Large touch targets
   - Native mobile inputs

3. TodoStats.jsx (Mobile-first stats):
   - Horizontal scroll cards
   - Large numbers (32px font)
   - Swipeable stat cards
   - Tap for details

4. EisenhowerMatrix.jsx (Mobile-first matrix):
   - Vertical stack on mobile (not 2×2 grid)
   - Collapsible quadrants
   - Swipe to expand/collapse
   - Drag-and-drop between quadrants

MOBILE OPTIMIZATION:
- Lazy load components (reduce initial bundle)
- Code split by route
- Preload on hover/focus (desktop)
- Preload on scroll proximity (mobile)

Keep TodoList.jsx as mobile-optimized orchestrator (< 300 lines).
```

## Prompt Part B - Extract Habit Utilities:

```
Create src/utils/habitCalculations.js for MOBILE PERFORMANCE:

EXTRACT THESE FUNCTIONS:
- getTodayMetrics (pure function)
- getWeeklyMetrics (pure function)
- calculateStreak (pure function)
- getHabitsBySchedule (new helper)
- getCompletionRate (new helper)

MOBILE OPTIMIZATION:
- Make all functions pure (easier to memoize)
- Add optional caching layer
- Optimize loops for mobile CPUs
- Add early returns for empty data
- Document performance characteristics

USAGE IN COMPONENTS:
- Import in HabitsModule.jsx
- Wrap with useMemo
- Add loading states for slow calculations
- Implement progressive loading (show partial results)

This reduces HabitsModule.jsx size and improves mobile performance.
```

## Expected Outcome:
- Better code organization
- Improved mobile performance
- Easier maintenance
- Faster feature development

## Testing Checklist:
- [ ] Components split correctly
- [ ] No functionality lost
- [ ] Performance improved
- [ ] Bundle size reduced
- [ ] Lazy loading works
