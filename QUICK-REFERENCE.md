# 🚀 Quick Reference Guide - New Features

## Phase 3: Engineering Improvements

### 1. Context + Reducer
```jsx
// Use in any component
import { useApp } from './hooks/useApp'

function MyComponent() {
  const { habits, addHabit, updateHabit, deleteHabit } = useApp()
  
  const handleAdd = () => {
    addHabit({ newHabit: 'Exercise', identity: 'Athlete' })
  }
}
```

### 2. Data Models
```jsx
import { Habit } from './models/Habit'

const habit = new Habit(data)
habit.validate() // Throws error if invalid
habit.markComplete() // Mark today as complete
habit.getStreak() // Get current streak
habit.getCompletionRate(30) // Get 30-day completion %
```

### 3. Error Boundaries
```jsx
import { ErrorBoundary } from './components/ErrorBoundary'

<ErrorBoundary showDetails={false}>
  <YourComponent />
</ErrorBoundary>
```

### 4. Offline Sync
```jsx
import { offlineSync } from './utils/offlineSync'

// Add to queue
offlineSync.addToQueue({
  execute: async () => await saveToServer(data)
})

// Subscribe to status
offlineSync.subscribe((status, queueLength) => {
  console.log(status) // 'online', 'offline', 'syncing', 'synced'
})
```

## Phase 4: Mobile UX

### 1. Swipeable Cards
```jsx
import SwipeableCard from './components/SwipeableCard'

<SwipeableCard
  onSwipeRight={() => markComplete(id)}
  onSwipeLeft={() => deleteItem(id)}
>
  <YourCard />
</SwipeableCard>
```

### 2. Pull-to-Refresh
```jsx
import PullToRefresh from './components/PullToRefresh'

<PullToRefresh onRefresh={async () => {
  await fetchData()
}}>
  <YourContent />
</PullToRefresh>
```

### 3. Haptic Feedback
```jsx
import { haptics } from './utils/haptics'

// Light tap
haptics.light()

// Success pattern
haptics.success()

// Error pattern
haptics.error()

// Custom pattern
haptics.vibrate([10, 50, 10])
```

### 4. Loading Skeletons
```jsx
import { SkeletonList, SkeletonHabitCard } from './components/Skeleton'

{loading ? (
  <SkeletonList count={5} type="habit" />
) : (
  <DataList />
)}
```

### 5. Empty States
```jsx
import { EmptyHabits, EmptyTodos, EmptyState } from './components/EmptyState'

{items.length === 0 ? (
  <EmptyHabits onAdd={() => setShowForm(true)} />
) : (
  <ItemList />
)}

// Custom empty state
<EmptyState
  icon={MyIcon}
  title="No Data"
  description="Add your first item"
  actionLabel="Add Item"
  onAction={handleAdd}
/>
```

## Common Patterns

### Complete Component with All Features
```jsx
import { useApp } from './hooks/useApp'
import { Habit } from './models/Habit'
import { haptics } from './utils/haptics'
import SwipeableCard from './components/SwipeableCard'
import PullToRefresh from './components/PullToRefresh'
import { SkeletonList } from './components/Skeleton'
import { EmptyHabits } from './components/EmptyState'
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary'

function HabitsModule() {
  const { habits, addHabit, updateHabit, deleteHabit } = useApp()
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    // Reload data
    setLoading(false)
  }

  const handleComplete = (id) => {
    haptics.success()
    // Mark complete
  }

  const handleDelete = (id) => {
    haptics.medium()
    deleteHabit(id)
  }

  return (
    <ModuleErrorBoundary moduleName="Habits">
      <PullToRefresh onRefresh={handleRefresh}>
        {loading ? (
          <SkeletonList count={5} type="habit" />
        ) : habits.length === 0 ? (
          <EmptyHabits onAdd={() => setShowForm(true)} />
        ) : (
          habits.map(habit => (
            <SwipeableCard
              key={habit.id}
              onSwipeRight={() => handleComplete(habit.id)}
              onSwipeLeft={() => handleDelete(habit.id)}
            >
              <HabitCard habit={habit} />
            </SwipeableCard>
          ))
        )}
      </PullToRefresh>
    </ModuleErrorBoundary>
  )
}
```

## Settings Integration

### Enable/Disable Haptics
```jsx
import { haptics } from './utils/haptics'
import { useApp } from './hooks/useApp'

function Settings() {
  const { settings, updateSettings } = useApp()

  const toggleHaptics = () => {
    const enabled = !settings.hapticFeedback
    haptics.setEnabled(enabled)
    updateSettings({ hapticFeedback: enabled })
  }
}
```

## Tips

1. **Haptics:** Use sparingly - only for important interactions
2. **Swipe:** Works best on mobile - disable on desktop
3. **Pull-to-Refresh:** Only on scrollable containers
4. **Skeletons:** Match the actual content layout
5. **Empty States:** Always provide a clear action
6. **Error Boundaries:** Wrap each major module separately
7. **Models:** Validate before saving to prevent bad data
8. **Context:** Use for shared state, keep local state in components

## Performance

- Skeletons improve perceived performance
- Haptics should be < 50ms for responsiveness
- Pull-to-refresh threshold: 80px
- Swipe threshold: 100px
- Error boundaries prevent full app crashes

---

**All features are optional and can be integrated incrementally!**
