# Mobile-First Redesign Prompts for Amazon Q

## 📱 Navigation & Layout

### Prompt 1: Bottom Navigation Bar
```
Redesign Navigation.jsx to use a bottom navigation bar for mobile devices. Add icons for Habits, To-Do, Budget, Transactions, and Dashboard tabs. Make it sticky at the bottom with smooth transitions. Keep the dark mode toggle in the top-right corner. Use touch-friendly 48px minimum tap targets.
```

### Prompt 2: Collapsible Header
```
Update DailyHabitView.jsx header to be collapsible on scroll. When scrolling down, minimize the date header to show only the day and progress percentage. Add a floating "Today" button that appears when scrolled away from current date.
```

### Prompt 3: Swipeable Tabs
```
Replace the tab buttons in App.jsx with swipeable tabs for mobile. Add swipe gestures to navigate between Habits, To-Do, Budget, Transactions, and Dashboard. Include visual indicators showing which tab is active and swipe direction hints.
```

## 🎯 Habit Management

### Prompt 4: Swipe Actions for Habits
```
Add swipe-to-action gestures in HabitList.jsx mobile cards. Swipe right to complete, swipe left to skip/delete. Show colored backgrounds during swipe (green for complete, red for delete). Add haptic feedback on action completion.
```

### Prompt 5: Quick Add FAB
```
Create a floating action button (FAB) for QuickHabitForm that stays visible while scrolling. Position it at bottom-right, above the navigation bar. Animate it to expand into the full form when tapped. Add a close button that shrinks it back.
```

### Prompt 6: Compact Habit Cards
```
Redesign HabitList.jsx mobile cards to be more compact. Stack information vertically, use smaller fonts, reduce padding. Add expandable sections for details (schedule, location, time). Show only essential info by default: habit name, identity, and today's status.
```

### Prompt 7: Gesture-Based Date Navigation
```
Add swipe gestures to DailyHabitView for date navigation. Swipe left for next day, right for previous day. Add a subtle animation showing the date change. Include a date picker modal accessible by tapping the date header.
```

### Prompt 8: One-Tap Habit Completion
```
Simplify habit completion in DailyHabitView mobile view. Make the entire habit card tappable to mark complete. Add a visual celebration animation (confetti, checkmark bounce) on completion. Show undo option for 3 seconds.
```

## ✅ To-Do List Optimization

### Prompt 9: Kanban Horizontal Scroll
```
Convert TodoList.jsx Kanban columns to horizontal scrolling on mobile. Make columns full-width, swipe between Backlog, In Progress, and Completed. Add dots indicator showing current column. Optimize for one-handed use.
```

### Prompt 10: Quick Task Entry
```
Redesign TodoList quick add form for mobile. Use a bottom sheet that slides up when FAB is tapped. Include voice input button, quick priority selection with emoji buttons, and smart date suggestions (Today, Tomorrow, This Week).
```

### Prompt 11: Task Card Gestures
```
Add swipe gestures to TodoItem cards. Swipe right to move to next status (Backlog → In Progress → Completed). Swipe left to delete. Long press to edit. Show visual feedback during gestures.
```

### Prompt 12: Focus Mode Enhancement
```
Improve TodoList Focus Mode for mobile. Show only 3 tasks in a card-based interface. Add a "Next Task" button that auto-advances. Include a timer for each task. Make it full-screen with minimal distractions.
```

## 💰 Budget & Transactions

### Prompt 13: Budget Overview Cards
```
Redesign YearlyBudget component with swipeable category cards for mobile. Each card shows category name, budget, spent, and remaining. Swipe through categories horizontally. Add visual progress bars and color coding (green=under budget, red=over).
```

### Prompt 14: Quick Transaction Entry
```
Create a mobile-optimized transaction entry in Transactions.jsx. Use a bottom sheet with large touch targets. Add calculator-style number pad for amount entry. Include recent categories and payment modes as quick-select chips.
```

### Prompt 15: Expense Scanner
```
Add a camera button to Transactions component for receipt scanning. Create a modal that opens device camera, captures receipt, and pre-fills transaction details. Include manual override options.
```

## 📊 Dashboard & Analytics

### Prompt 16: Dashboard Widget Cards
```
Redesign Dashboard.jsx with scrollable widget cards for mobile. Each widget (habits summary, budget overview, upcoming tasks) is a full-width card. Add pull-to-refresh. Make widgets reorderable with long-press and drag.
```

### Prompt 17: Progress Visualization
```
Create mobile-friendly progress charts in Dashboard. Use vertical bar charts instead of horizontal. Add tap-to-expand for detailed views. Include weekly/monthly toggle. Optimize for portrait orientation.
```

### Prompt 18: Streak Celebration
```
Add a streak celebration modal that appears when opening the app after maintaining a habit streak. Show animated streak count, motivational message, and share button. Make it dismissible with swipe down gesture.
```

## 🎨 UI Components

### Prompt 19: Touch-Optimized Buttons
```
Update all Button.jsx components to be touch-friendly. Minimum 44px height, larger padding, bigger text. Add pressed state with scale animation. Ensure proper spacing between buttons (minimum 8px gap).
```

### Prompt 20: Mobile-First Modal
```
Redesign Modal.jsx to slide up from bottom on mobile instead of center overlay. Make it draggable to dismiss. Add a handle bar at top. Support full-screen mode for complex forms. Include smooth spring animations.
```

### Prompt 21: Improved Input Fields
```
Enhance Input.jsx for mobile. Larger font size (16px minimum to prevent zoom), bigger touch targets, floating labels, clear button inside input. Add input type-specific keyboards (numeric for numbers, email for email).
```

### Prompt 22: Dropdown Optimization
```
Replace standard dropdowns with mobile-friendly bottom sheet pickers. Show options in a scrollable list with large touch targets. Add search functionality for long lists. Include a "Done" button at top.
```

## 🔔 Notifications & Feedback

### Prompt 23: Toast Notifications
```
Redesign toast notifications to appear at bottom of screen (above navigation bar). Make them swipeable to dismiss. Add action buttons (Undo, View). Use different colors for success, error, info. Auto-dismiss after 4 seconds.
```

### Prompt 24: Haptic Feedback
```
Add haptic feedback throughout the app. Light tap on button press, medium on habit completion, heavy on streak milestone. Add success vibration pattern on task completion. Make it toggleable in settings.
```

### Prompt 25: Loading States
```
Create mobile-optimized loading states. Use skeleton screens instead of spinners. Show content placeholders that match the actual layout. Add shimmer animation. Include pull-to-refresh with custom animation.
```

## 🌙 Dark Mode & Themes

### Prompt 26: Enhanced Dark Mode
```
Improve dark mode colors for OLED screens. Use true black (#000000) for backgrounds. Reduce brightness of accent colors. Add smooth transition animation when toggling. Save preference to localStorage.
```

### Prompt 27: Theme Customization
```
Add theme color picker for mobile. Let users choose accent color (blue, purple, green, pink). Apply to buttons, progress bars, and highlights. Show preview before applying. Include preset themes.
```

## ⚡ Performance & Optimization

### Prompt 28: Lazy Loading
```
Implement lazy loading for HabitList and TodoList on mobile. Load 10 items initially, load more on scroll. Add "Load More" button at bottom. Show loading indicator while fetching. Optimize for smooth scrolling.
```

### Prompt 29: Offline Support
```
Add offline mode indicator. Show banner when offline. Queue actions (add habit, complete task) and sync when online. Use service worker for caching. Display sync status in navigation bar.
```

### Prompt 30: Image Optimization
```
Optimize all icons and images for mobile. Use SVG where possible. Lazy load images. Add blur-up effect for loading. Compress assets. Implement responsive images with srcset.
```

## 📅 Calendar & Scheduling

### Prompt 31: Calendar View
```
Create a mobile calendar view for habits. Show month view with dots indicating habit completion. Tap date to see that day's habits. Swipe between months. Add heatmap visualization showing consistency.
```

### Prompt 32: Time Picker
```
Replace standard time input with mobile-friendly time picker. Use iOS-style scrollable wheels or Android-style clock face. Make it easy to select AM/PM. Add quick time presets (Morning, Afternoon, Evening).
```

## 🔍 Search & Filter

### Prompt 33: Search Interface
```
Add search functionality with mobile-optimized interface. Slide down from top when search icon tapped. Show recent searches. Include filters (by identity, location, time). Display results as you type.
```

### Prompt 34: Filter Bottom Sheet
```
Create filter bottom sheet for habits and todos. Show filter options as chips (All, Active, Completed). Add date range picker. Include sort options (by time, priority, name). Apply filters with animation.
```

## 📱 Native Features

### Prompt 35: Share Functionality
```
Add share button to habit progress. Generate shareable image with weekly progress chart. Include social media sharing options. Add "Copy Link" option. Support native share sheet on mobile devices.
```

### Prompt 36: Notifications Permission
```
Add push notification setup flow. Show benefits before requesting permission. Create notification settings page. Allow users to choose notification times for habit reminders. Include test notification button.
```

### Prompt 37: Biometric Lock
```
Add optional biometric authentication (fingerprint/face ID) for app access. Show setup screen on first launch. Include fallback PIN option. Store preference securely. Add toggle in settings.
```

## 🎯 Onboarding & Help

### Prompt 38: Mobile Onboarding
```
Create mobile-first onboarding flow. Use full-screen cards with illustrations. Explain key features (habit stacking, swipe gestures, focus mode). Add skip button. Include interactive tutorial for first habit creation.
```

### Prompt 39: Contextual Help
```
Add contextual help tooltips for mobile. Show on first use of each feature. Use coach marks with arrows. Make dismissible with tap. Include "Show Tips" option in settings to replay.
```

### Prompt 40: Empty States
```
Design engaging empty states for mobile. Show illustrations and helpful text. Include primary action button (Add First Habit, Create Task). Add tips for getting started. Make it encouraging and friendly.
```

## 🔄 Sync & Backup

### Prompt 41: Export/Import
```
Add export functionality for mobile. Generate JSON backup of all data. Include import from file. Add "Export to Cloud" option. Show last backup date. Make it accessible from settings.
```

### Prompt 42: Data Management
```
Create data management screen for mobile. Show storage usage by category. Add clear data options (habits, todos, transactions). Include confirmation dialogs. Add "Reset App" option with warning.
```

## 🎨 Animations & Transitions

### Prompt 43: Page Transitions
```
Add smooth page transitions for mobile. Slide left/right when changing tabs. Fade in/out for modals. Use spring animations for interactive elements. Keep animations under 300ms for responsiveness.
```

### Prompt 44: Micro-interactions
```
Add micro-interactions throughout the app. Button press animations, checkbox checkmark draw, progress bar fill animation. Use CSS transforms for performance. Add loading state animations.
```

## 📊 Stats & Insights

### Prompt 45: Weekly Summary
```
Create weekly summary card for mobile. Show at top of Dashboard on Mondays. Include total habits completed, streak count, completion rate. Add motivational message. Make shareable.
```

### Prompt 46: Habit Insights
```
Add insights page for individual habits. Show completion heatmap, best day of week, average completion time. Include streak history graph. Add suggestions for improvement. Optimize for mobile scrolling.
```

## 🔧 Settings & Preferences

### Prompt 47: Mobile Settings
```
Redesign settings page for mobile. Use grouped list layout. Include sections: Appearance, Notifications, Data, About. Add toggle switches for preferences. Include version number and feedback button.
```

### Prompt 48: Accessibility Options
```
Add accessibility settings for mobile. Include font size adjustment, high contrast mode, reduce motion option. Add screen reader optimizations. Test with VoiceOver/TalkBack. Include accessibility statement.
```

## 🎯 Advanced Features

### Prompt 49: Habit Templates
```
Create habit template library for mobile. Show popular templates (Morning Routine, Fitness, Learning). Use card-based layout. Add preview before adding. Include customize option. Make templates swipeable.
```

### Prompt 50: Gamification
```
Add gamification elements for mobile. Show XP points for completed habits. Include achievement badges. Create level system. Add leaderboard (optional). Display progress with animated progress bar.
```

---

## 🚀 Implementation Priority

### Phase 1 - Critical Mobile UX (Prompts 1-10)
- Bottom navigation, swipe gestures, FAB, compact cards

### Phase 2 - Core Features (Prompts 11-25)
- Kanban optimization, budget cards, dashboard widgets, touch optimization

### Phase 3 - Enhanced Experience (Prompts 26-40)
- Dark mode, performance, calendar, search, onboarding

### Phase 4 - Advanced Features (Prompts 41-50)
- Sync, animations, insights, settings, gamification

---

## 📝 Usage Instructions

1. **Copy the prompt** you want to implement
2. **Paste into Amazon Q** chat
3. **Add context** if needed (e.g., "@DailyHabitView.jsx")
4. **Review the generated code** before applying
5. **Test on mobile device** or browser DevTools mobile view
6. **Iterate** if adjustments needed

## 🎯 Best Practices

- Always test on actual mobile devices
- Use Chrome DevTools mobile emulation during development
- Test with different screen sizes (iPhone SE, iPhone 14 Pro Max, Android)
- Verify touch targets are minimum 44x44px
- Test with one hand (thumb-friendly design)
- Ensure text is readable without zooming (minimum 16px)
- Test in both portrait and landscape orientations
- Verify dark mode looks good
- Test with slow network connections
- Check battery usage and performance

## 📱 Target Devices

- iPhone SE (375x667) - Small screen
- iPhone 14 Pro (393x852) - Standard
- iPhone 14 Pro Max (430x932) - Large
- Samsung Galaxy S21 (360x800) - Android standard
- iPad Mini (768x1024) - Tablet

## 🔗 Related Files

- `src/components/Navigation.jsx` - Top navigation
- `src/components/DailyHabitView.jsx` - Daily habit view
- `src/components/HabitList.jsx` - Habit list with cards
- `src/components/QuickHabitForm.jsx` - Habit creation form
- `src/components/TodoList.jsx` - To-do list with Kanban
- `src/components/YearlyBudget.jsx` - Budget management
- `src/components/Transactions.jsx` - Transaction tracking
- `src/components/Dashboard.jsx` - Dashboard overview
- `src/components/ui/` - Reusable UI components
