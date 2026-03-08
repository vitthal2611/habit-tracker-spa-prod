# Step 11: Onboarding Flow - Mobile-First Sample Data & Tour

## Priority: 🟢 LOW

## Prompt:

```
Create src/components/OnboardingWizard.jsx with MOBILE-FIRST onboarding:

MOBILE ONBOARDING FLOW:
- Full-screen wizard (not modal)
- Swipeable steps (horizontal scroll)
- Progress dots at bottom
- Large, clear illustrations
- Minimal text (mobile-readable)

STEP 1 - WELCOME (Mobile-optimized):
- App logo (80px)
- Welcome message (24px font)
- 3 module icons with labels
- "Get Started" button (full width, 52px)

STEP 2 - QUICK SETUP (Mobile form):
- "What's your name?" (large input)
- "What's your main goal?" (3 large cards):
  - 🏃 Health & Habits
  - ✅ Productivity & Tasks
  - 💰 Finance & Budgets
- Tap card to select (haptic feedback)
- "Next" button (full width)

STEP 3 - SAMPLE DATA (Mobile choice):
- "Start with examples?" (large text)
- Two large cards (full width, 100px each):
  - "Load Sample Data" (with preview)
  - "Start Fresh" (blank slate)
- Swipe up to see sample data preview

MOBILE SAMPLE DATA:
- 3 habits: 💧 Drink water, 🏃 Exercise, 📚 Read
- 5 tasks: Mix of all quadrants with due dates
- 10 transactions: Last 7 days with categories

MOBILE TOUR (After setup):
- Spotlight tooltips (not full overlay)
- Point to key features with arrows
- Tap anywhere to continue
- Skip button always visible
- 5 steps max (mobile attention span)

Save 'hasCompletedOnboarding' flag. Show on first launch only.
Optimize for portrait mobile screens.
```

## Expected Outcome:
- 50% reduction in abandonment
- Faster time-to-value
- Better feature discovery
- Guided first experience

## Testing Checklist:
- [ ] Wizard swipeable
- [ ] Sample data loads
- [ ] Tour highlights features
- [ ] Skip option works
- [ ] Only shows once
