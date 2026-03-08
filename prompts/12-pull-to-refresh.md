# Step 12: Pull-to-Refresh - Mobile-First Polish

## Priority: 🟢 LOW

## Prompt:

```
@HabitsModule.jsx @TodosModule.jsx @ExpensesModule.jsx 

Add MOBILE-FIRST pull-to-refresh:

MOBILE PTR IMPLEMENTATION:
- Use existing PullToRefresh component
- Wrap main content area (below header)
- Custom refresh indicator (spinner + text)
- Haptic feedback on pull threshold
- Smooth spring animation

REFRESH BEHAVIOR:
- Pull down 80px to trigger
- Show loading spinner (1-2 seconds)
- Reload data from localStorage
- Recalculate all metrics
- Show success toast with haptic
- Scroll to top smoothly

MOBILE OPTIMIZATIONS:
- Disable during scroll momentum
- Prevent over-scroll bounce conflicts
- Work with safe area insets
- Smooth 60fps animation
- Cancel on horizontal swipe

EXAMPLE IMPLEMENTATION:
<PullToRefresh 
  onRefresh={async () => {
    if (navigator.vibrate) navigator.vibrate(10)
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Reload data
    showToast('✓ Refreshed!')
  }}
  threshold={80}
  resistance={2.5}
>
  {/* module content */}
</PullToRefresh>

Add to all three main modules. Ensure smooth mobile experience.
```

## Expected Outcome:
- Native mobile feel
- Manual sync option
- Better perceived performance
- Haptic feedback

## Testing Checklist:
- [ ] Pull gesture works
- [ ] Haptic feedback present
- [ ] Data refreshes
- [ ] Animation smooth
- [ ] No conflicts with scroll
