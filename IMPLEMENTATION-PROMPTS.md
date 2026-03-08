# Amazon Q Implementation Prompts

Step-by-step prompts to implement all product and engineering improvements.

---

## PHASE 1: CRITICAL PRODUCT FIXES (Week 1-2)

### Prompt 1.1: Implement Eisenhower Matrix for To-Do List

```
Update the To-Do List module to implement the Eisenhower Matrix (4 quadrants) instead of the current Kanban board.

Requirements:
1. Add new fields to todo data model:
   - quadrant: "Q1" | "Q2" | "Q3" | "Q4"
   - importance: "high" | "low"
   - urgency: "urgent" | "not-urgent"
   - suggestedAction: "DO" | "SCHEDULE" | "DELEGATE" | "ELIMINATE"
   - delegatedTo: string (optional, for Q3 tasks)

2. Create function to auto-calculate quadrant:
   - Q1 (DO): Important + Urgent (due within 3 days + high priority)
   - Q2 (SCHEDULE): Important + Not Urgent (high priority + due > 3 days)
   - Q3 (DELEGATE): Not Important + Urgent (low/medium priority + due within 3 days)
   - Q4 (ELIMINATE): Not Important + Not Urgent (low priority + no urgency)

3. Replace Kanban columns with 4 quadrants:
   - Q1: Red background, "DO NOW" label
   - Q2: Blue background, "SCHEDULE" label
   - Q3: Yellow background, "DELEGATE" label
   - Q4: Gray background, "ELIMINATE" label

4. Update TodoList component to display tasks in matrix grid (2x2)

5. Add quick actions per quadrant:
   - Q1: "Start Now" button
   - Q2: "Schedule" button (opens time picker)
   - Q3: "Delegate" button (opens email input)
   - Q4: "Delete" button

Files to modify:
- src/modules/todos/components/TodoList.jsx
- Update todo data structure in all CRUD operations
```

---

### Prompt 1.2: Add Envelope Budgeting Income Allocation Flow

```
Implement envelope budgeting system for the Expense Tracker module.

Requirements:
1. Add new data structure for monthly budget:
   {
     "month": "2024-01",
     "income": 50000,
     "allocated": 45000,
     "unallocated": 5000,
     "envelopes": [
       { "id": "env_1", "name": "Rent", "allocated": 15000, "spent": 0, "remaining": 15000 }
     ]
   }

2. Create Income Allocation Wizard (multi-step modal):
   Step 1: Enter monthly income
   Step 2: Allocate to essentials (rent, utilities, groceries)
   Step 3: Allocate to savings goals
   Step 4: Allocate to discretionary spending
   Step 5: Review (ensure unallocated = 0)

3. Show unallocated income warning if > 0

4. Add "Allocate Income" button at top of expense manager

5. Display envelope cards showing:
   - Envelope name
   - Allocated amount
   - Spent amount
   - Remaining amount
   - Progress bar (spent/allocated)

6. When adding expense, show remaining balance in selected envelope

Files to modify:
- src/modules/expenses/components/ExpenseManager.jsx
- Create new component: src/modules/expenses/components/IncomeAllocationWizard.jsx
- Create new component: src/modules/expenses/components/EnvelopeCard.jsx
```

---

### Prompt 1.3: Add Payment Mode Balance Tracking

```
Add payment mode balance tracking to Expense Tracker.

Requirements:
1. Add payment modes data structure:
   {
     "paymentModes": [
       { "id": "pm_1", "name": "HDFC Bank", "balance": 25000, "type": "bank" },
       { "id": "pm_2", "name": "Cash", "balance": 5000, "type": "cash" },
       { "id": "pm_3", "name": "SBI Credit Card", "balance": -8000, "type": "credit", "limit": 50000 }
     ]
   }

2. Create Payment Mode Manager modal:
   - Add/edit/delete payment modes
   - Set initial balance
   - Set credit limit (for credit cards)

3. Update transaction flow:
   - When adding expense, deduct from payment mode balance
   - When adding income, add to payment mode balance
   - Show warning if payment mode balance insufficient

4. Add "Transfer" transaction type:
   - Transfer between payment modes
   - Example: Cash to Bank, Bank to Credit Card

5. Display payment mode cards showing:
   - Mode name
   - Current balance
   - Type indicator (bank/cash/credit)
   - For credit: show used/limit

Files to modify:
- src/modules/expenses/components/ExpenseManager.jsx
- Create new component: src/modules/expenses/components/PaymentModeManager.jsx
- Create new component: src/modules/expenses/components/PaymentModeCard.jsx
```

---

### Prompt 1.4: Implement Bottom Navigation

```
Replace top navigation tabs with bottom navigation bar for mobile-first design.

Requirements:
1. Create BottomNav component with 4 tabs:
   - Habits (Target icon)
   - Tasks (CheckSquare icon)
   - Money (DollarSign icon)
   - Stats (BarChart3 icon)

2. Style requirements:
   - Fixed at bottom of screen
   - Safe area inset for iOS devices
   - Active tab: colored icon + label
   - Inactive tabs: gray icon + label
   - Smooth transition animations

3. Add haptic feedback on tab change (if supported)

4. Update App.jsx to use bottom navigation instead of top tabs

5. Add padding-bottom to main content area to prevent overlap

Files to modify:
- src/App.jsx
- Create new component: src/components/BottomNav.jsx
- Update: src/index.css (add safe-area-inset-bottom)
```

---

## PHASE 2: HABIT TRACKER ENHANCEMENT (Week 3-4)

### Prompt 2.1: Add Habit Scorecard

```
Implement Habit Scorecard feature based on Atomic Habits principles.

Requirements:
1. Create Habit Scorecard component:
   - List all current habits (good, bad, neutral)
   - User marks each habit as: + (good), - (bad), = (neutral)
   - Show frequency: daily, weekly, rarely

2. Add to habit data model:
   {
     "habitType": "good" | "bad" | "neutral",
     "currentFrequency": "daily" | "weekly" | "rarely",
     "awarenessScore": 1-10
   }

3. Create Scorecard view (separate tab in Habits module):
   - Table format: Habit | Type | Frequency | Score
   - Editable inline
   - Filter by type

4. Add "Start Scorecard" onboarding flow for new users

5. Link scorecard habits to habit creation:
   - "Improve this habit" button on each row
   - Pre-fills habit form with scorecard data

Files to create:
- src/modules/habits/components/HabitScorecard.jsx
- src/modules/habits/components/ScorecardRow.jsx

Files to modify:
- src/modules/habits/HabitsModule.jsx
- src/modules/habits/components/QuickHabitForm.jsx
```

---

### Prompt 2.2: Implement Habit Difficulty Progression

```
Add difficulty progression system for habits (2-minute rule implementation).

Requirements:
1. Add phases to habit data model:
   {
     "phases": [
       { "phase": 1, "action": "Put on running shoes", "days": 7, "completed": false },
       { "phase": 2, "action": "Walk 5 minutes", "days": 14, "completed": false },
       { "phase": 3, "action": "Run 10 minutes", "days": 21, "completed": false }
     ],
     "currentPhase": 1
   }

2. Update habit form to include phase builder:
   - Add phase button
   - Each phase: action description + duration in days
   - Minimum 1 phase, maximum 5 phases

3. Auto-advance to next phase when:
   - Current phase days completed
   - User confirms readiness

4. Show phase progress in habit card:
   - "Phase 1 of 3: Put on running shoes"
   - Progress bar for current phase
   - "Advance to Phase 2" button when ready

5. Add phase completion celebration animation

Files to modify:
- src/modules/habits/components/QuickHabitForm.jsx
- src/modules/habits/components/HabitList.jsx
- Create new component: src/modules/habits/components/PhaseProgressCard.jsx
```

---

### Prompt 2.3: Add Temptation Bundling

```
Implement temptation bundling feature for habit motivation.

Requirements:
1. Add to habit data model:
   {
     "temptationBundle": {
       "need": "Exercise",
       "want": "Listen to favorite podcast",
       "rule": "I can only listen while exercising"
     }
   }

2. Add temptation bundling section in habit form:
   - "I need to: [habit action]"
   - "I want to: [enjoyable activity]"
   - "My rule: I can only [want] while [need]"

3. Display temptation bundle in habit card:
   - Show as colorful badge
   - Icon: Link or Zap
   - Tooltip with full rule

4. Add temptation bundle suggestions:
   - Common pairings database
   - Example: Exercise + Podcast, Cleaning + Music, Studying + Coffee

Files to modify:
- src/modules/habits/components/QuickHabitForm.jsx
- src/modules/habits/components/HabitList.jsx
- Create new file: src/utils/temptationBundles.js (suggestions database)
```

---

### Prompt 2.4: Improve Habit Statement Builder

```
Enhance the habit implementation intention builder with better UX.

Requirements:
1. Create visual habit statement builder:
   - Large, colorful preview card
   - Real-time updates as user types
   - Animated transitions

2. Add cue suggestions based on time and location:
   - Morning cues: "After I wake up", "After I brush teeth"
   - Evening cues: "After I finish dinner", "Before I go to bed"
   - Location-based: "When I enter kitchen", "When I arrive at gym"

3. Add environment design prompts:
   - "Make it obvious": Where will you see the cue?
   - "Make it attractive": What makes this appealing?
   - "Make it easy": What's the 2-minute version?
   - "Make it satisfying": How will you celebrate?

4. Show habit statement in multiple formats:
   - Standard: "After I [cue], I will [action] in [location]"
   - Identity: "I am a [identity] who [action]"
   - Outcome: "I [action] to become [identity]"

Files to modify:
- src/modules/habits/components/QuickHabitForm.jsx
- Create new component: src/modules/habits/components/HabitStatementPreview.jsx
```

---

## PHASE 3: ENGINEERING IMPROVEMENTS (Week 5-6)

### Prompt 3.1: Refactor to Context + Reducer Pattern

```
Refactor state management from useState to Context + Reducer pattern.

Requirements:
1. Create AppContext with reducer:
   - State: { habits, todos, transactions, budgets, settings }
   - Actions: ADD_HABIT, UPDATE_HABIT, DELETE_HABIT, etc.

2. Create reducer function with all CRUD actions

3. Wrap App with AppProvider

4. Replace all useState in modules with useApp hook

5. Ensure localStorage sync in reducer

Files to create:
- src/contexts/AppContext.jsx
- src/reducers/appReducer.js
- src/hooks/useApp.js

Files to modify:
- src/main.jsx (wrap with AppProvider)
- src/modules/habits/HabitsModule.jsx
- src/modules/todos/TodosModule.jsx
- src/modules/expenses/ExpensesModule.jsx
```

---

### Prompt 3.2: Create Unified Data Models

```
Create class-based data models for all entities with validation.

Requirements:
1. Create BaseEntity class:
   - id generation
   - createdAt, updatedAt timestamps
   - isDeleted flag
   - validate() method

2. Create Habit class extending BaseEntity:
   - All habit fields
   - validate() method (check required fields)
   - toJSON() method

3. Create Todo class extending BaseEntity:
   - All todo fields
   - calculateQuadrant() method
   - validate() method

4. Create Transaction class extending BaseEntity:
   - All transaction fields
   - validate() method

5. Update all CRUD operations to use these classes

Files to create:
- src/models/BaseEntity.js
- src/models/Habit.js
- src/models/Todo.js
- src/models/Transaction.js

Files to modify:
- All module files to use new models
```

---

### Prompt 3.3: Add Error Boundaries

```
Implement error boundaries for graceful error handling.

Requirements:
1. Create ErrorBoundary component:
   - Catch errors in child components
   - Display user-friendly error message
   - Log errors to console
   - Provide "Reload" button

2. Create ModuleErrorBoundary for each module:
   - Module-specific error messages
   - Fallback UI

3. Wrap each module with ErrorBoundary

4. Add error logging utility:
   - Log to localStorage
   - Include timestamp, error message, stack trace

Files to create:
- src/components/ErrorBoundary.jsx
- src/components/ModuleErrorBoundary.jsx
- src/utils/errorLogger.js

Files to modify:
- src/App.jsx (wrap modules)
```

---

### Prompt 3.4: Implement Offline Sync

```
Add offline support with sync queue.

Requirements:
1. Create OfflineSync class:
   - Queue for pending actions
   - Process queue when online
   - Store queue in localStorage

2. Add online/offline indicator in UI

3. Update all CRUD operations to use offline sync:
   - Add to queue if offline
   - Execute immediately if online

4. Add sync status indicator:
   - Synced (green checkmark)
   - Syncing (spinner)
   - Offline (cloud with slash)

5. Add manual sync button

Files to create:
- src/utils/offlineSync.js
- src/components/OnlineStatus.jsx
- src/components/SyncStatus.jsx

Files to modify:
- src/contexts/AppContext.jsx (integrate offline sync)
```

---

## PHASE 4: MOBILE UX POLISH (Week 7-8)

### Prompt 4.1: Add Swipe Gestures

```
Implement swipe gestures for quick actions on mobile.

Requirements:
1. Install react-swipeable: npm install react-swipeable

2. Add swipe gestures to habit cards:
   - Swipe right: Mark complete (green background)
   - Swipe left: Delete (red background)
   - Show action hint while swiping

3. Add swipe gestures to todo cards:
   - Swipe right: Complete
   - Swipe left: Delete

4. Add swipe gestures to transaction rows:
   - Swipe left: Delete

5. Add haptic feedback on swipe actions

Files to modify:
- src/modules/habits/components/HabitList.jsx
- src/modules/todos/components/TodoList.jsx
- src/modules/expenses/components/ExpenseManager.jsx
- Create new component: src/components/SwipeableCard.jsx
```

---

### Prompt 4.2: Implement Pull-to-Refresh

```
Add pull-to-refresh functionality for data sync.

Requirements:
1. Install react-pull-to-refresh: npm install react-pull-to-refresh

2. Add pull-to-refresh to all module views:
   - Habits list
   - Todos list
   - Transactions list

3. On refresh:
   - Show loading spinner
   - Sync data from localStorage
   - Process offline queue
   - Show success message

4. Add custom refresh indicator with app branding

Files to modify:
- src/modules/habits/HabitsModule.jsx
- src/modules/todos/TodosModule.jsx
- src/modules/expenses/ExpensesModule.jsx
```

---

### Prompt 4.3: Add Haptic Feedback

```
Implement haptic feedback for user actions.

Requirements:
1. Create haptic utility:
   - Light tap (50ms)
   - Medium tap (100ms)
   - Success vibration (pattern)
   - Error vibration (pattern)

2. Add haptic feedback to:
   - Button clicks
   - Habit completion
   - Task completion
   - Swipe actions
   - Tab changes

3. Add setting to enable/disable haptics

4. Check browser support before triggering

Files to create:
- src/utils/haptics.js

Files to modify:
- All interactive components
- src/contexts/AppContext.jsx (add haptics setting)
```

---

### Prompt 4.4: Optimize Animations

```
Improve animation performance and add micro-interactions.

Requirements:
1. Install framer-motion: npm install framer-motion

2. Add animations to:
   - Modal open/close (slide up from bottom)
   - List item add (fade in + slide up)
   - List item delete (fade out + slide left)
   - Tab change (fade + slide)
   - Success actions (scale + bounce)

3. Add loading skeletons for:
   - Habit cards
   - Todo cards
   - Transaction rows

4. Optimize animations:
   - Use transform instead of position
   - Use will-change for animated elements
   - Reduce animation duration on low-end devices

Files to modify:
- All components with animations
- Create new component: src/components/Skeleton.jsx
```

---

## PHASE 5: ANALYTICS & INSIGHTS (Week 9-10)

### Prompt 5.1: Build Analytics Dashboard

```
Create analytics dashboard with key metrics.

Requirements:
1. Create Analytics module (4th tab in bottom nav)

2. Display metrics:
   - Habit completion rate (last 7 days, 30 days)
   - Current streaks (all habits)
   - Task completion rate by quadrant
   - Budget adherence rate
   - Spending by category (pie chart)
   - Income vs Expense trend (line chart)

3. Add date range selector:
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - Custom range

4. Add export analytics button (PDF/CSV)

Files to create:
- src/modules/analytics/AnalyticsModule.jsx
- src/modules/analytics/components/MetricCard.jsx
- src/modules/analytics/components/HabitChart.jsx
- src/modules/analytics/components/SpendingChart.jsx
- src/utils/analytics.js (calculation functions)
```

---

### Prompt 5.2: Add Habit Insights

```
Generate insights and suggestions for habits.

Requirements:
1. Calculate habit metrics:
   - Completion rate per habit
   - Best performing time of day
   - Best performing day of week
   - Longest streak
   - Current streak

2. Generate insights:
   - "You complete habits better in the morning"
   - "Your Monday habits have 85% success rate"
   - "You're on a 7-day streak for meditation!"

3. Add suggestions:
   - "Try stacking [habit] after [best performing habit]"
   - "Your [habit] success drops on weekends. Add a reminder?"

4. Display insights in Habits module:
   - Insights card at top
   - Swipeable carousel
   - Dismiss button

Files to create:
- src/modules/habits/components/HabitInsights.jsx
- src/utils/habitAnalytics.js
```

---

### Prompt 5.3: Add Spending Insights

```
Generate spending insights and budget recommendations.

Requirements:
1. Calculate spending metrics:
   - Top spending categories
   - Spending trend (increasing/decreasing)
   - Budget adherence by category
   - Average daily spending
   - Projected month-end balance

2. Generate insights:
   - "You're spending 20% more on Food this month"
   - "You've saved ₹5000 compared to last month"
   - "Your Petrol budget will exceed by ₹1000"

3. Add recommendations:
   - "Reduce Food budget by ₹2000 next month"
   - "Transfer ₹1000 from Entertainment to Groceries"

4. Display insights in Expenses module:
   - Insights banner at top
   - Alert for budget overruns
   - Suggestions for optimization

Files to create:
- src/modules/expenses/components/SpendingInsights.jsx
- src/utils/spendingAnalytics.js
```

---

### Prompt 5.4: Add Productivity Metrics

```
Track and display productivity metrics across all modules.

Requirements:
1. Calculate productivity score:
   - Habits completed today / total habits
   - Q1 tasks completed / total Q1 tasks
   - Budget adherence rate
   - Overall score: weighted average

2. Display productivity dashboard:
   - Daily score (0-100)
   - Weekly trend chart
   - Monthly comparison
   - Best day of week

3. Add productivity streaks:
   - Days with 80%+ score
   - Current streak
   - Longest streak

4. Add gamification:
   - Badges for milestones
   - Level system (1-10)
   - Achievements

Files to create:
- src/modules/analytics/components/ProductivityDashboard.jsx
- src/utils/productivityScore.js
- src/components/Badge.jsx
```

---

## BONUS: QUICK WINS

### Prompt B.1: Add Loading States

```
Add loading states to all async operations.

Requirements:
1. Create Skeleton components for:
   - Habit card
   - Todo card
   - Transaction row

2. Show skeleton while loading data

3. Add loading spinner for:
   - Form submissions
   - Data sync
   - Modal actions

Files to create:
- src/components/Skeleton.jsx
- src/components/LoadingSpinner.jsx
```

---

### Prompt B.2: Add Empty States

```
Create empty states for all modules.

Requirements:
1. Empty state for Habits:
   - Illustration
   - "Start your first habit!"
   - "Add Habit" button

2. Empty state for Todos:
   - Illustration
   - "No tasks yet"
   - "Add Task" button

3. Empty state for Expenses:
   - Illustration
   - "Set up your budget"
   - "Get Started" button

Files to create:
- src/components/EmptyState.jsx
```

---

### Prompt B.3: Add Keyboard Shortcuts

```
Implement keyboard shortcuts for power users.

Requirements:
1. Add shortcuts:
   - 'n': New habit/task/transaction (context-aware)
   - '/': Focus search
   - 'Esc': Close modal
   - '1-4': Switch tabs
   - 'h': Toggle help modal

2. Create keyboard shortcuts help modal

3. Show shortcuts in tooltips

Files to create:
- src/hooks/useKeyboardShortcut.js
- src/components/KeyboardShortcutsHelp.jsx
```

---

### Prompt B.4: Add Data Export

```
Add CSV export for all data.

Requirements:
1. Export habits to CSV:
   - All habit details
   - Completion history

2. Export todos to CSV:
   - All task details
   - Completion status

3. Export transactions to CSV:
   - All transaction details
   - Monthly summaries

4. Add "Export All Data" button in settings

Files to create:
- src/utils/exportCSV.js
```

---

## TESTING PROMPTS

### Test Prompt 1: Unit Tests

```
Create unit tests for core utilities and functions.

Requirements:
1. Install testing libraries:
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

2. Create tests for:
   - Data models (validation)
   - Analytics calculations
   - Quadrant calculation
   - Offline sync queue

3. Add test scripts to package.json

Files to create:
- src/models/__tests__/Habit.test.js
- src/utils/__tests__/analytics.test.js
- vitest.config.js
```

---

### Test Prompt 2: Integration Tests

```
Create integration tests for user flows.

Requirements:
1. Test habit creation flow:
   - Open form
   - Fill fields
   - Submit
   - Verify in list

2. Test todo quadrant assignment:
   - Create task with due date
   - Verify correct quadrant
   - Change priority
   - Verify quadrant update

3. Test expense budget validation:
   - Add transaction
   - Verify budget check
   - Test overspend alert

Files to create:
- src/__tests__/habitFlow.test.jsx
- src/__tests__/todoFlow.test.jsx
- src/__tests__/expenseFlow.test.jsx
```

---

## DEPLOYMENT PROMPTS

### Deploy Prompt 1: Build Optimization

```
Optimize production build.

Requirements:
1. Add code splitting for modules

2. Optimize images and assets

3. Add service worker for PWA

4. Configure build settings in vite.config.js:
   - Minification
   - Tree shaking
   - Chunk splitting

5. Add build size analysis

Files to modify:
- vite.config.js
- package.json (add build scripts)
```

---

### Deploy Prompt 2: PWA Setup

```
Convert app to Progressive Web App.

Requirements:
1. Add manifest.json:
   - App name, icons, theme color
   - Display mode: standalone
   - Start URL

2. Add service worker:
   - Cache static assets
   - Offline fallback
   - Background sync

3. Add install prompt

4. Add iOS meta tags

Files to create:
- public/manifest.json
- public/sw.js
- src/utils/pwaInstall.js

Files to modify:
- index.html (add meta tags)
```

---

## USAGE INSTRUCTIONS

1. Copy each prompt individually to Amazon Q
2. Review the generated code before applying
3. Test thoroughly after each implementation
4. Commit changes after each phase
5. Update this document with any modifications

## PRIORITY ORDER

**Must Have (Phase 1):**
- Eisenhower Matrix
- Envelope Budgeting
- Payment Mode Tracking
- Bottom Navigation

**Should Have (Phase 2-3):**
- Habit Enhancements
- State Management Refactor
- Error Handling

**Nice to Have (Phase 4-5):**
- Mobile UX Polish
- Analytics Dashboard
- Insights

**Future:**
- Testing
- PWA
- Advanced Features
