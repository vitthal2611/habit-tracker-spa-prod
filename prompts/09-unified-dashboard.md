# Step 9: Cross-Module Integration - Mobile-First Unified Dashboard

## Priority: 🟡 MEDIUM

## Prompt:

```
Create src/modules/dashboard/UnifiedDashboard.jsx with MOBILE-FIRST design:

MOBILE DASHBOARD LAYOUT:
- Vertical scroll (single column)
- Card-based sections with spacing
- Pull-to-refresh support
- Swipeable cards for details

MOBILE SECTIONS:
1. TODAY'S FOCUS (Hero card, 120px height):
   - Date and greeting
   - Overall completion score (circular progress)
   - Quick stats (3 columns: habits, tasks, spending)

2. HABITS TO COMPLETE (Compact list):
   - Top 3 pending habits for today
   - Large checkboxes (48px touch target)
   - Swipe right to complete
   - "View All" button

3. URGENT TASKS (Priority list):
   - Top 3 tasks by priority + due date
   - Color-coded by quadrant
   - Tap to open task details
   - Swipe left to delete, right to complete

4. TODAY'S EXPENSES (Summary card):
   - Total spent today (large number)
   - Top 3 categories (horizontal chips)
   - Budget remaining (progress bar)
   - FAB to add expense

5. QUICK ACTIONS (Bottom section):
   - 3 large buttons (full width, 52px each):
     - "Add Habit" → Opens habit form
     - "Add Task" → Opens task form  
     - "Add Expense" → Opens expense form

MOBILE INTERACTIONS:
- Swipe cards left/right for actions
- Long press for options menu
- Haptic feedback on interactions
- Smooth animations (300ms)
- Safe area padding

Use data from @AppContext.jsx. Make this the default home screen on mobile.
Optimize for one-handed use with bottom-heavy layout.
```

## Expected Outcome:
- Holistic life management view
- Cross-module insights
- Quick access to all features
- Increased engagement

## Testing Checklist:
- [ ] All modules integrated
- [ ] Swipe gestures work
- [ ] Quick actions functional
- [ ] One-handed usable
- [ ] Performance smooth
