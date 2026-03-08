# Step 2: Fix Stats Tab - Mobile-First Dashboard

## Priority: 🔴 HIGH

## Prompt Part 1:

```
Create src/modules/stats/StatsModule.jsx with MOBILE-FIRST design:

MOBILE LAYOUT:
- Single column card layout (no grid on mobile)
- Large touch-friendly stat cards (min 80px height)
- Swipeable chart sections (use touch gestures)
- Pull-to-refresh support
- Bottom sheet for detailed views

CONTENT:
1. Hero card: Today's overview (habits completed, tasks done, spending)
2. Habits card: This month completion rate with progress ring
3. Tasks card: Completion rate by quadrant (visual pie chart)
4. Expenses card: Budget vs actual with horizontal bar
5. Trends card: Simple 7-day sparkline charts

Use @AppContext.jsx for data. Optimize for mobile viewport first, 
then enhance for tablet/desktop. Use Tailwind mobile-first breakpoints 
(sm:, md:, lg:). Add haptic feedback on card taps.
```

## Prompt Part 2:

```
@App.jsx Update stats module to use StatsModule. Ensure it works smoothly 
on mobile with proper touch interactions and safe area padding.
```

## Expected Outcome:
- Functional stats dashboard
- Mobile-optimized layout
- Cross-module insights
- Touch-friendly interactions

## Testing Checklist:
- [ ] Stats load correctly
- [ ] Cards are swipeable
- [ ] Pull-to-refresh works
- [ ] Data from all modules displays
- [ ] Haptic feedback on interactions
