# TodoList Quick Reference Guide

## 🎯 New Features at a Glance

### 📊 Statistics Dashboard (Top of Page)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 📋 Total    │ ✅ Completed│ ⚠️ Overdue  │ ⏰ Due Today│
│    15       │     8       │     2       │     3       │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### 🔍 Search & Filters
```
┌────────────────────────────────────────────────────────┐
│ 🔍 Search tasks...                    [🔽 Filters]     │
├────────────────────────────────────────────────────────┤
│ Status: [All ▼]  Priority: [All ▼]  Date: [__] to [__]│
└────────────────────────────────────────────────────────┘
```

### 🏷️ Tags System
```
Task: "Complete project documentation"
Tags: [urgent] [work] [review] + Add tag...
      ↑ Pink/Purple gradient badges
```

### 📝 Task Card Layout
```
┌────────────────────────────────────────────────────────┐
│ ☐ Task Name                                    [✏️] [❌]│
│                                                         │
│ [Work] [🔴 High] [📅 Dec 25] [⏱️ 30m] [🔄 Daily]      │
│ [🏷️ urgent] [🏷️ review]                               │
│ ☑️ 2/3 subtasks                                        │
└────────────────────────────────────────────────────────┘
```

## 🎨 Priority Color Coding

- 🔴 **High Priority**: Red background, urgent tasks
- 🟡 **Medium Priority**: Yellow background, normal tasks  
- 🔵 **Low Priority**: Blue background, can wait

## 📅 Date Grouping

Tasks are automatically grouped by due date:

1. **⚠️ Overdue** - Past due date (red highlight)
2. **📅 Today** - Due today
3. **📅 Tomorrow** - Due tomorrow
4. **📅 Later** - Future dates
5. **📅 No Date** - No due date set

## 🔄 Kanban Columns

```
┌──────────────┬──────────────┬──────────────┐
│  📋 Backlog  │ 🔄 In Progress│ ✅ Completed │
│   (Slate)    │   (Indigo)   │   (Green)    │
├──────────────┼──────────────┼──────────────┤
│ ⚠️ Overdue   │ ⚠️ Overdue   │ ⚠️ Overdue   │
│ • Task 1     │ • Task 4     │ • Task 7     │
│              │              │              │
│ 📅 Today     │ 📅 Today     │ 📅 Today     │
│ • Task 2     │ • Task 5     │ • Task 8     │
│ • Task 3     │              │              │
│              │              │              │
│ 📅 Later     │ 📅 Later     │ 📅 Later     │
│ • Task 6     │              │ • Task 9     │
└──────────────┴──────────────┴──────────────┘
     ↕️ Drag & Drop (Desktop) ↕️
```

## ✨ Animations

- **Hover**: Cards scale up slightly (1.02x)
- **Fade-in**: New tasks appear smoothly
- **Drag**: Visual feedback when dragging
- **Overdue**: Pulsing red border (2px)

## 🎯 Focus Mode

Toggle to show only:
- High priority tasks
- Tasks due today
- Top 3 most important tasks

## 📋 Subtasks

```
Main Task: "Launch website"
  ├─ ☑️ Design homepage
  ├─ ☐ Write content
  └─ ☐ Deploy to server
  
Progress: ☑️ 1/3
```

## 🔄 Recurring Tasks

Set up tasks that repeat automatically:

- **Daily**: Every day at specified time
- **Weekly**: Every [Monday/Tuesday/etc]
- **Monthly**: First day of each month

When completed, a new instance is created automatically!

## 🏷️ Using Tags

### Adding Tags
1. Type tag name in "Add tag..." field
2. Press Enter or click "Add"
3. Tag appears as colored badge

### Tag Suggestions
System suggests previously used tags:
```
Suggestions: [+ urgent] [+ review] [+ waiting]
```

### Removing Tags
Click the ❌ on any tag badge to remove it

## 🔍 Search Tips

- Search is case-insensitive
- Searches task names only
- Real-time filtering
- Combine with filters for precision

## 🎛️ Filter Combinations

Example workflows:

1. **Today's High Priority**
   - Status: In Progress
   - Priority: High
   - Date: Today

2. **Overdue Work Tasks**
   - Category: Work
   - Date Range: Before today
   - Status: Not Completed

3. **This Week's Tasks**
   - Date Range: Mon to Sun
   - Status: All
   - Priority: All

## ⌨️ Keyboard Shortcuts

- **Enter**: Add task / Add tag / Add subtask
- **Escape**: Close modals
- **Tab**: Navigate between fields

## 📱 Mobile Features

- Touch-friendly buttons (44px minimum)
- Swipe gestures supported
- Responsive grid layouts
- Collapsible sections
- Bottom navigation friendly

## 💾 Data Persistence

All data is saved automatically to localStorage:
- Tasks
- Categories
- Tags
- Filters
- Preferences

## 🎨 Dark Mode

Fully supported with:
- Adjusted colors for OLED screens
- Proper contrast ratios
- Smooth transitions
- All features work in both modes

## 📊 Statistics Explained

### Total Tasks
All tasks regardless of status

### Completed
Tasks marked as done (in Completed column)

### Overdue
Tasks with due date < today AND not completed

### Due Today
Tasks with due date = today AND not completed

## 🚀 Quick Actions

- **+ Button**: Quick add task (bottom right)
- **Edit Icon**: Modify task details
- **❌ Icon**: Delete task (with confirmation)
- **Checkbox**: Toggle completion
- **Drag**: Move between columns (desktop)

## 💡 Pro Tips

1. Use tags for cross-category organization
2. Set recurring tasks for daily routines
3. Break large tasks into subtasks
4. Use Focus Mode when overwhelmed
5. Filter by date range for weekly planning
6. Search to quickly find specific tasks
7. Drag tasks to change status quickly
8. Add time estimates for better planning

## 🎯 Best Practices

- **Be Specific**: Clear task names help with search
- **Use Tags**: Better than creating too many categories
- **Set Due Dates**: Helps with prioritization
- **Break Down**: Use subtasks for complex tasks
- **Review Daily**: Check overdue and today's tasks
- **Time Estimates**: Helps with daily planning
- **Recurring Tasks**: For habits and routines

---

**Need Help?** All features are intuitive and include visual feedback!
