# Phase 2 Quick Reference Card

## 🎯 Habit Scorecard

### Purpose
Track current habits and mark them as good, bad, or neutral for awareness.

### Component
`<HabitScorecard habits={[]} onSave={fn} onCreateHabit={fn} />`

### Features
- Add habits with text input
- Mark as: + (good), = (neutral), - (bad)
- Set frequency: daily, weekly, rarely
- Awareness score: 1-10
- "Improve" button for bad habits
- Delete habits
- Save to localStorage

### Data Structure
```javascript
{
  id: "habit_123",
  text: "Check phone first thing",
  type: "bad" | "neutral" | "good",
  frequency: "daily" | "weekly" | "rarely",
  awarenessScore: 5
}
```

### Usage
```javascript
const [scorecardHabits, setScorecardHabits] = useState([])

<HabitScorecard
  habits={scorecardHabits}
  onSave={(habits) => setScorecardHabits(habits)}
  onCreateHabit={(habit) => {
    // Pre-fill habit form with scorecard data
    setFormData(habit)
    setView('form')
  }}
/>
```

---

## 📈 Phase Progress Card

### Purpose
Break habits into easier phases using the 2-minute rule.

### Component
`<PhaseProgressCard habit={habit} onUpdate={fn} />`

### Features
- 1-5 phases per habit
- Each phase: action + days
- Progress bar per phase
- Auto-advance when complete
- "Advance to Phase X" button
- Edit phases anytime
- Tracks completed days

### Data Structure
```javascript
{
  phases: [
    {
      action: "Put on running shoes",
      days: 7,
      completed: false,
      completedDays: 0
    },
    {
      action: "Walk 5 minutes",
      days: 14,
      completed: false,
      completedDays: 0
    }
  ],
  currentPhase: 0
}
```

### Usage
```javascript
<PhaseProgressCard
  habit={habit}
  onUpdate={(updatedHabit) => updateHabit(updatedHabit)}
/>
```

### Phase Advancement
- Automatically shows "Advance" button when phase complete
- Updates `currentPhase` index
- Resets `completedDays` for new phase

---

## 🔗 Temptation Bundling

### Purpose
Pair something you need to do with something you want to do.

### Component
`<TemptationBundling habit={habit} onUpdate={fn} />`

### Features
- "I need to" field
- "I want to" field
- "My rule" field
- 5 pre-built suggestions
- Visual badge display
- Edit modal

### Data Structure
```javascript
{
  temptationBundle: {
    need: "Exercise",
    want: "Listen to favorite podcast",
    rule: "I can only listen while exercising"
  }
}
```

### Suggestions Database
```javascript
[
  { need: 'Exercise', want: 'Listen to podcast', rule: '...' },
  { need: 'Clean house', want: 'Listen to music', rule: '...' },
  { need: 'Study', want: 'Drink coffee', rule: '...' },
  { need: 'Work on project', want: 'Sit in favorite chair', rule: '...' },
  { need: 'Cook healthy meal', want: 'Watch cooking show', rule: '...' }
]
```

### Usage
```javascript
<TemptationBundling
  habit={habit}
  onUpdate={(updatedHabit) => updateHabit(updatedHabit)}
/>
```

---

## 📝 Habit Statement Preview

### Purpose
Visual builder for habit implementation intentions with environment design.

### Component
`<HabitStatementPreview habit={habit} onUpdate={fn} />`

### Features
- Real-time statement preview
- Multiple formats:
  - Standard: "After I [cue], I will [action] in [location]"
  - Identity: "I am a [identity] who [action]"
- 4 Laws prompts:
  - Make it Obvious
  - Make it Attractive
  - Make it Easy
  - Make it Satisfying
- Cue suggestions by category

### Data Structure
```javascript
{
  cue: "brush my teeth",
  action: "meditate for 2 minutes",
  location: "bedroom",
  identity: "mindful person",
  makeObvious: "Put meditation cushion by bed",
  makeAttractive: "Light a nice candle",
  makeEasy: "Just 2 minutes to start",
  makeSatisfying: "Check off on calendar"
}
```

### Cue Suggestions
```javascript
{
  morning: [
    'After I wake up',
    'After I brush my teeth',
    'After I make coffee',
    'After I shower'
  ],
  evening: [
    'After I finish dinner',
    'Before I go to bed',
    'After I change clothes',
    'After I turn off TV'
  ],
  location: [
    'When I enter kitchen',
    'When I arrive at gym',
    'When I sit at desk',
    'When I get in car'
  ]
}
```

### Usage
```javascript
<HabitStatementPreview
  habit={formData}
  onUpdate={(updatedData) => setFormData(updatedData)}
/>
```

---

## 🎨 Color Coding

### Habit Scorecard
- **Green:** Good habits (+)
- **Red:** Bad habits (-)
- **Gray:** Neutral habits (=)

### Phase Progress
- **Purple to Pink:** Gradient for phases
- **Progress bar:** Purple to pink gradient

### Temptation Bundling
- **Yellow to Orange:** Gradient background
- **Link icon:** Yellow

### Statement Preview
- **Indigo to Purple:** Main statement
- **Emerald to Teal:** Identity statement
- **Blue:** Make it Obvious
- **Pink:** Make it Attractive
- **Green:** Make it Easy
- **Yellow:** Make it Satisfying

---

## 📦 Integration Checklist

### HabitsModule.jsx
```javascript
// 1. Import components
import HabitScorecard from './components/HabitScorecard'
import PhaseProgressCard from './components/PhaseProgressCard'
import TemptationBundling from './components/TemptationBundling'
import HabitStatementPreview from './components/HabitStatementPreview'

// 2. Add state
const [scorecardHabits, setScorecardHabits] = useState(() => {
  const saved = localStorage.getItem('scorecardHabits')
  return saved ? JSON.parse(saved) : []
})

// 3. Add persistence
useEffect(() => {
  localStorage.setItem('scorecardHabits', JSON.stringify(scorecardHabits))
}, [scorecardHabits])

// 4. Add tab
<button onClick={() => setView('scorecard')}>
  Scorecard
</button>

// 5. Add view
{view === 'scorecard' && (
  <HabitScorecard
    habits={scorecardHabits}
    onSave={setScorecardHabits}
    onCreateHabit={(habit) => {
      setView('form')
      setFormData(habit)
    }}
  />
)}

// 6. Add to habit card
<PhaseProgressCard habit={habit} onUpdate={updateHabit} />
<TemptationBundling habit={habit} onUpdate={updateHabit} />

// 7. Add to habit form
<HabitStatementPreview habit={formData} onUpdate={setFormData} />
```

---

## 🧪 Quick Test

### Habit Scorecard
1. Add habit: "Check phone first thing"
2. Mark as bad (-)
3. Set frequency: daily
4. Set score: 3
5. Click "Improve" → should pre-fill form

### Phase Progress
1. Add phase: "Put on running shoes" (7 days)
2. Add phase: "Walk 5 minutes" (14 days)
3. Complete 7 days → "Advance" button appears
4. Click advance → moves to phase 2

### Temptation Bundling
1. Need: "Exercise"
2. Want: "Listen to podcast"
3. Rule: "I can only listen while exercising"
4. Save → badge appears

### Statement Preview
1. Enter cue: "brush my teeth"
2. Enter action: "meditate"
3. Enter location: "bedroom"
4. See statement update in real-time
5. Fill 4 Laws prompts

---

## 💡 Tips

### Scorecard
- Start with 5-10 current habits
- Be honest about good/bad/neutral
- Focus on awareness, not judgment
- Use "Improve" for bad habits

### Phases
- Start with 2-minute version
- Gradually increase difficulty
- Don't skip phases
- Celebrate phase completions

### Temptation Bundling
- Pair strong want with need
- Make rule specific
- Use suggestions for ideas
- Only do want during need

### Statement Builder
- Use specific cues
- Make action clear
- Choose obvious location
- Fill all 4 Laws prompts

---

## 📊 Data Flow

```
Scorecard → Improve → Pre-fill Form → Create Habit
                                    ↓
                            Add Phases
                                    ↓
                            Add Temptation Bundle
                                    ↓
                            Build Statement
                                    ↓
                            Save Habit
```

---

## 🎯 Success Metrics

- ✅ All 4 components created
- ✅ ~800 lines of code
- ✅ Full dark mode support
- ✅ Responsive design
- ✅ localStorage persistence
- ✅ Production ready

---

**Phase 2 Quick Reference v1.0** 🎉
