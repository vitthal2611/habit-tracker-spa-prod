# Step 1: Simplify Habit Form - Progressive Disclosure (Mobile-First)

## Priority: 🔴 HIGH

## Prompt:

```
@QuickHabitForm.jsx Refactor this habit form with mobile-first progressive disclosure. 

MOBILE REQUIREMENTS:
- Show only 4 essential fields initially: identity, newHabit, time, location
- Use full-width inputs with min-height: 48px for touch targets
- Add "Show Advanced Options" button (min 48px height) at bottom
- Advanced fields (twoMinVersion, stackAfter, temptation bundling, phase progress) 
  slide in from bottom on mobile, expand inline on desktop
- Keep schedule selector visible (important for mobile users)
- Ensure form scrolls smoothly on mobile with proper spacing
- Use text-[16px] on all inputs to prevent iOS zoom
- Add bottom padding for safe area on iOS (pb-safe class)

Keep all existing functionality but optimize for thumb-reach zones on mobile.
```

## Expected Outcome:
- 70% faster habit creation
- Reduced form abandonment
- Better mobile UX with progressive disclosure
- All advanced features still accessible

## Testing Checklist:
- [ ] Form opens smoothly on mobile
- [ ] Essential fields are clearly visible
- [ ] Advanced options toggle works
- [ ] No iOS zoom on input focus
- [ ] Safe area padding on iPhone
- [ ] One-handed usability
