# Mobile UI Quick Reference Guide

## 🎯 Touch Target Standards

```
Critical Actions:  52px × 52px  (Add, Submit, Delete)
Primary Actions:   48px × 48px  (Navigation, View Toggles)
Secondary Actions: 44px × 44px  (Edit, Cancel, Select)
Minimum Standard:  44px × 44px  (All interactive elements)
```

## 📏 Typography Scale

```
Hero Numbers:  40-50px  (Stats, Metrics)
H1 Headings:   24-30px  (Page Titles)
H2 Headings:   20-24px  (Section Titles)
H3 Headings:   18-20px  (Subsections)
Body Text:     14-16px  (Content)
Small Text:    12-14px  (Labels, Metadata)
Input Text:    16px     (EXACT - prevents zoom)
```

## 🎨 Spacing System

```
Padding:
  Cards:       16-20px (mobile), 24px (desktop)
  Buttons:     12-16px horizontal, 12px vertical
  Inputs:      16px horizontal, 12-14px vertical

Gaps:
  Small:       8px   (between related items)
  Medium:      12px  (between groups)
  Large:       16px  (between sections)
  XLarge:      24px  (between major sections)

Margins:
  Mobile:      16px  (screen edges)
  Desktop:     24px  (screen edges)
```

## 🔘 Button Styles

```jsx
// Critical Action (52px)
<button className="min-h-[52px] px-6 py-3 text-base font-bold bg-indigo-600 text-white rounded-xl shadow-md active:scale-95">
  Add Habit
</button>

// Primary Action (48px)
<button className="min-h-[48px] px-5 py-3 text-base font-bold bg-white rounded-lg shadow-md active:scale-95">
  Today
</button>

// Secondary Action (44px)
<button className="min-h-[44px] px-4 py-2.5 text-sm font-bold text-gray-600 rounded-xl active:scale-95">
  Cancel
</button>
```

## 📝 Input Styles

```jsx
// Standard Input (16px font - NO ZOOM)
<input 
  type="text"
  className="w-full px-4 py-3.5 text-[16px] bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 min-h-[48px]"
/>

// Date Input
<input 
  type="date"
  className="w-full px-4 py-3.5 text-[16px] bg-gray-50 border border-gray-300 rounded-xl min-h-[48px]"
/>

// Select Dropdown
<select className="w-full px-4 py-3.5 text-[16px] bg-gray-50 border border-gray-300 rounded-xl min-h-[48px]">
  <option>Option 1</option>
</select>
```

## 📊 Stats Display

```jsx
// Large Stats Card
<div className="bg-white rounded-2xl p-5 shadow-sm">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <span className="text-sm font-semibold text-gray-500">Label</span>
  </div>
  <h3 className="text-4xl sm:text-5xl font-black text-gray-900">42</h3>
  <p className="text-sm text-gray-500 mt-2">Description</p>
</div>
```

## 🎭 Modal Styles

```jsx
// Mobile-Optimized Modal
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
  <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
    <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
      <h2 className="text-xl font-bold">Title</h2>
      <button className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl active:scale-95">
        <X className="w-6 h-6" />
      </button>
    </div>
    <div className="p-5">
      {/* Content */}
    </div>
  </div>
</div>
```

## 🎨 Color System

```
Primary:    indigo-600  (Buttons, Links)
Success:    green-500   (Completed, Success)
Error:      red-500     (Errors, Delete)
Warning:    orange-500  (Warnings, Skipped)
Info:       blue-500    (Information)

Backgrounds:
  Light:    white, gray-50
  Dark:     gray-800, gray-900

Text:
  Primary:  gray-900 (light), white (dark)
  Secondary: gray-600 (light), gray-400 (dark)
  Tertiary: gray-500 (light), gray-500 (dark)
```

## 🔄 Animation Standards

```css
/* Active State */
.active\:scale-95:active {
  transform: scale(0.95);
}

/* Transition */
.transition-all {
  transition: all 200ms ease-in-out;
}

/* Fade In */
.animate-fade-in {
  animation: fadeIn 300ms ease-in;
}

/* Scale In */
.animate-scale-in {
  animation: scaleIn 200ms ease-out;
}
```

## 📐 Border Radius

```
Small:   8px   (rounded-lg)
Medium:  12px  (rounded-xl)
Large:   16px  (rounded-2xl)
Full:    9999px (rounded-full)
```

## 🌑 Shadow Scale

```
Small:   shadow-sm   (Subtle elevation)
Medium:  shadow-md   (Cards, buttons)
Large:   shadow-lg   (Modals, dropdowns)
XLarge:  shadow-xl   (Floating elements)
2XLarge: shadow-2xl  (Toasts, alerts)
```

## 📱 Responsive Breakpoints

```
Mobile:   < 640px   (default, no prefix)
Tablet:   ≥ 640px   (sm:)
Desktop:  ≥ 768px   (md:)
Large:    ≥ 1024px  (lg:)
XLarge:   ≥ 1280px  (xl:)
```

## ✅ Mobile Checklist

Before deploying any new component:

- [ ] All touch targets ≥ 44px
- [ ] All inputs use 16px font
- [ ] Active animations on buttons
- [ ] Proper spacing (16px+)
- [ ] Rounded corners (xl/2xl)
- [ ] Adequate shadows
- [ ] Bold fonts for emphasis
- [ ] Test on mobile device
- [ ] Test dark mode
- [ ] Test one-handed use

## 🚫 Common Mistakes to Avoid

```
❌ DON'T: Use font-size < 16px on inputs (causes zoom)
✅ DO:    Use text-[16px] exactly

❌ DON'T: Make buttons < 44px height
✅ DO:    Use min-h-[44px] or larger

❌ DON'T: Forget active states
✅ DO:    Add active:scale-95

❌ DON'T: Use small icons (< 20px)
✅ DO:    Use 20-24px icons minimum

❌ DON'T: Cramped spacing (< 8px)
✅ DO:    Use 12-16px gaps

❌ DON'T: Thin progress bars (< 8px)
✅ DO:    Use 12px height minimum

❌ DON'T: Small stats (< 24px)
✅ DO:    Use 40px+ for numbers
```

## 🎯 Quick Copy-Paste Templates

### Button Template
```jsx
<button className="min-h-[48px] px-5 py-3 text-base font-bold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all">
  Click Me
</button>
```

### Input Template
```jsx
<input 
  type="text"
  placeholder="Enter text"
  className="w-full px-4 py-3.5 text-[16px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[48px]"
/>
```

### Card Template
```jsx
<div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
  {/* Content */}
</div>
```

### Stats Template
```jsx
<div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
  42
</div>
```

---

## 📚 Additional Resources

- Apple Human Interface Guidelines
- Material Design Guidelines
- WCAG 2.1 Accessibility Standards
- Tailwind CSS Documentation

---

**Quick Reference Version:** 1.0
**Last Updated:** 2024
**Status:** Production Ready
