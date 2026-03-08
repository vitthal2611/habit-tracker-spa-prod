# Step 4: Optimize Performance - Mobile-First Memoization & Debouncing

## Priority: 🔴 HIGH

## Prompt Part A - Memoize Habit Calculations:

```
@HabitsModule.jsx Optimize for MOBILE PERFORMANCE:

Add useMemo to expensive calculations:
- getTodayMetrics (recalculates on every render)
- getWeeklyMetrics (loops through 7 days × all habits)
- Streak calculations (365 day loops)

MOBILE OPTIMIZATION:
- Memoize based on habits array reference
- Add loading states for calculations > 100ms
- Use requestIdleCallback for non-critical calculations
- Implement virtual scrolling if habit list > 50 items

This prevents jank on mobile devices during scrolling and interactions.
```

## Prompt Part B - Debounce localStorage:

```
@AppContext.jsx Add MOBILE-OPTIMIZED debouncing:

REQUIREMENTS:
- Debounce localStorage writes by 500ms (reduce battery drain)
- Batch multiple rapid changes into single write
- Use optimistic updates (UI updates immediately, storage writes later)
- Add write queue for offline mode
- Implement background sync when app regains focus

MOBILE CONSIDERATIONS:
- Reduce write frequency on low battery
- Pause writes when app is backgrounded
- Resume writes when app becomes active
- Show sync indicator during batch writes

This improves mobile battery life and reduces storage wear.
```

## Prompt Part C - Memoize Expense Calculations:

```
@EnhancedExpenseManager.jsx Optimize for MOBILE RENDERING:

Wrap expensive functions with useMemo:
- getMonthlyData (filters all transactions)
- getCategorySpending (maps and sorts categories)
- getTrends (calculates 3 months of data)

MOBILE OPTIMIZATION:
- Only recalculate when transactions or budgetMonth changes
- Add skeleton loading for calculations > 100ms
- Lazy load charts (render only when visible)
- Use React.memo for chart components
- Implement intersection observer for off-screen charts

This ensures smooth 60fps scrolling on mobile devices.
```

## Expected Outcome:
- 40% faster interactions
- Smoother animations
- Better battery life
- Reduced storage writes
- 60fps scrolling

## Testing Checklist:
- [ ] No lag during scrolling
- [ ] Calculations don't block UI
- [ ] Battery usage reduced
- [ ] localStorage writes batched
- [ ] Smooth 60fps animations
