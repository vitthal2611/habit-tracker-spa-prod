# Modern Habit Tracker SPA

A beautiful, single-page React application for tracking habits with smooth navigation and delightful UX.

## ✨ Features

- **Single Page Application** - No page reloads, smooth tab navigation
- **Comprehensive Habit Management** - Identity, current habits, new habits, location, time, duration
- **Habit Stacking** - Link habits together ("After I do X, I will do Y")
- **Dynamic Dropdowns** - Add new options directly in dropdowns
- **Progress Tracking** - Weekly, monthly, yearly views with visual progress bars
- **Dark/Light Mode** - System preference detection with smooth transitions
- **Local Storage** - All data persists between sessions
- **Responsive Design** - Mobile-first, works on all devices
- **Smooth Animations** - Fade-in, slide-up, scale effects

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx   # Button with variants
│   │   ├── Input.jsx    # Styled input field
│   │   ├── Card.jsx     # Container component
│   │   ├── Modal.jsx    # Modal with animations
│   │   ├── Dropdown.jsx # Dropdown with add new functionality
│   │   └── Toggle.jsx   # Toggle switch for dark mode
│   ├── Navigation.jsx   # Top navigation with tabs
│   ├── HabitForm.jsx    # Habit creation form
│   └── HabitList.jsx    # Habit display and management
├── hooks/
│   └── useLocalStorage.js # Local storage hook
└── App.jsx              # Main SPA component
```

## 🎨 Design System

### Colors
- **Primary**: Blue tones for main actions
- **Success**: Green for completed habits
- **Gray**: Neutral tones for secondary elements

### Components
All components use Tailwind utility classes with consistent spacing, colors, and animations.

### Animations
- `fade-in` - Element appearance
- `slide-up` - Modal animations  
- `scale-in` - Button interactions

## 📱 Usage

1. **Home Tab** - Overview with stats and quick access
2. **Habits Tab** - Full habit management
3. **Progress Tab** - Visual progress tracking
4. **Dark Mode** - Toggle in top navigation

### Creating Habits
- Fill out identity, current habit, new habit
- Set location, time, and duration
- Optionally stack after existing habits
- Add new dropdown options on the fly

### Tracking Progress
- Click checkmark to complete daily habits
- View 7-day progress bars for each habit
- Monitor streaks and completion rates
- Analyze weekly/monthly/yearly trends

## 🔧 Build Commands

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## 🎯 Key Features

- **No Page Reloads** - Pure SPA with React state management
- **Habit Stacking** - Chain habits together for better formation
- **Dynamic Forms** - Add dropdown options without leaving the form
- **Visual Progress** - Color-coded weekly progress indicators
- **Responsive** - Mobile-optimized with touch-friendly interactions
- **Accessible** - Keyboard navigation and screen reader support

Built with modern React patterns, Tailwind CSS, and focus on user experience.