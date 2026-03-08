# Step 14: Accessibility Audit - Mobile-First ARIA & Touch Nav

## Priority: 🟢 LOW

## Prompt Part A - Add Mobile-First ARIA Labels:

```
@HabitsModule.jsx @TodosModule.jsx @ExpensesModule.jsx

Add MOBILE-OPTIMIZED accessibility:

TOUCH TARGET REQUIREMENTS:
- All interactive elements min 48px × 48px
- Spacing between targets min 8px
- Clear focus indicators (4px outline)

ARIA LABELS (Mobile screen reader):
- Checkboxes: "Mark [habit name] as complete for [date]"
- Edit buttons: "Edit [item name]"
- Delete buttons: "Delete [item name], this cannot be undone"
- Navigation: "Go to [previous/next] [month/week]"
- FABs: "Add new [habit/task/expense]"

MOBILE SCREEN READER:
- Announce state changes (completed, deleted, added)
- Announce loading states
- Announce errors clearly
- Support swipe gestures (VoiceOver, TalkBack)

Add role, aria-label, aria-pressed, aria-expanded to all interactive elements.
Optimize for mobile screen readers (VoiceOver on iOS, TalkBack on Android).
```

## Prompt Part B - Mobile Touch Navigation:

```
@TodoList.jsx @HabitsModule.jsx Add MOBILE TOUCH SHORTCUTS:

GESTURE SHORTCUTS:
- Swipe right on item: Complete/check
- Swipe left on item: Delete
- Long press: Show options menu
- Double tap: Quick edit
- Pinch: Zoom text (respect system settings)

KEYBOARD SHORTCUTS (Bluetooth keyboard on mobile):
- Space: Toggle selected item
- Enter: Quick add
- Delete/Backspace: Delete selected
- Arrow keys: Navigate list
- Cmd/Ctrl + F: Focus search

MOBILE HELP:
- "?" button in header → Bottom sheet with gestures
- Animated gesture demonstrations
- First-time gesture hints (tooltips)
- Haptic feedback for gesture recognition

Use existing useKeyboardShortcut hook. Add gesture detection for mobile.
Ensure shortcuts work with mobile screen readers.
```

## Expected Outcome:
- WCAG 2.1 AA compliance
- Screen reader support
- Gesture navigation
- Better usability

## Testing Checklist:
- [ ] VoiceOver works (iOS)
- [ ] TalkBack works (Android)
- [ ] Touch targets adequate
- [ ] Gestures functional
- [ ] Keyboard shortcuts work
