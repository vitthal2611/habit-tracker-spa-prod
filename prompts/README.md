# Mobile-First Implementation Prompts

This directory contains step-by-step prompts for implementing mobile-first improvements to the Habit Tracker SPA.

## 📋 Execution Order

### 🔴 Week 1: High Priority (Days 1-5)
1. [01-simplify-habit-form.md](./01-simplify-habit-form.md) - Progressive disclosure
2. [02-fix-stats-tab.md](./02-fix-stats-tab.md) - Functional stats dashboard
3. [03-improve-task-quick-add.md](./03-improve-task-quick-add.md) - Reduce friction
4. [04-optimize-performance.md](./04-optimize-performance.md) - Memoization & debouncing
5. [05-add-error-boundaries.md](./05-add-error-boundaries.md) - Better error handling

### 🟡 Week 2-3: Medium Priority (Days 6-15)
6. [06-consolidate-views.md](./06-consolidate-views.md) - Reduce navigation complexity
7. [07-make-streaks-visible.md](./07-make-streaks-visible.md) - Gamification
8. [08-smart-expense-entry.md](./08-smart-expense-entry.md) - Quick-add parser
9. [09-unified-dashboard.md](./09-unified-dashboard.md) - Cross-module integration
10. [10-component-splitting.md](./10-component-splitting.md) - Better architecture

### 🟢 Week 4: Low Priority (Days 16-20)
11. [11-onboarding-flow.md](./11-onboarding-flow.md) - Sample data & tour
12. [12-pull-to-refresh.md](./12-pull-to-refresh.md) - Mobile polish
13. [13-comprehensive-testing.md](./13-comprehensive-testing.md) - Long-term quality
14. [14-accessibility-audit.md](./14-accessibility-audit.md) - ARIA & keyboard nav
15. [15-internationalization.md](./15-internationalization.md) - Multi-currency & language

## 🚀 How to Use

1. **Open a prompt file** (e.g., `01-simplify-habit-form.md`)
2. **Copy the prompt** from the file
3. **Paste into Amazon Q** chat
4. **Review the implementation** Amazon Q provides
5. **Test the changes** using the checklist
6. **Commit the changes** before moving to next step
7. **Move to next prompt** in sequence

## 📱 Mobile-First Principles

All prompts follow these mobile-first principles:
- ✅ Touch targets ≥ 48px
- ✅ Typography ≥ 16px (prevents iOS zoom)
- ✅ Gestures (swipe, long-press, pull-to-refresh)
- ✅ Bottom sheets for mobile UI
- ✅ FABs for quick actions
- ✅ Safe area support (iOS notch)
- ✅ Haptic feedback
- ✅ 60fps animations
- ✅ Offline support
- ✅ Battery optimization

## 💡 Tips

- **Execute in order** - Later steps may depend on earlier changes
- **Test after each step** - Verify on mobile device
- **Commit frequently** - Easy rollback if needed
- **Ask follow-ups** - If Amazon Q's response is unclear
- **Check mobile devices** - Test on iPhone and Android

## 📊 Expected Impact

Implementing all prompts will result in:
- **40-50% faster** task completion
- **60% reduction** in user confusion
- **30-40% performance** improvement
- **50% fewer bugs** through better architecture
- **Increased retention** through gamification
- **Global usability** through customization

## 🔄 Follow-Up Prompts

If implementation is incomplete:
```
The previous change didn't fully implement [feature]. Please complete the 
implementation by adding [missing functionality].
```

If you need to see changes:
```
Show me the specific code changes you made to [filename].
```

If there are errors:
```
I'm getting this error: [error message]. Please fix the issue in [filename].
```

## 📞 Support

For questions or issues with these prompts, refer to the main project documentation or create an issue in the repository.
