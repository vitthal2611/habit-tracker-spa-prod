// Test Data Generator - Creates 30 habits
// Run this in browser console after logging in

const testHabits = [
  { identity: 'healthy person', current: 'wake up', new: 'drink water', time: '06:00', location: 'kitchen' },
  { identity: 'healthy person', current: 'drink water', new: 'stretch', time: '06:05', location: 'bedroom' },
  { identity: 'healthy person', current: 'stretch', new: 'meditate', time: '06:15', location: 'living room' },
  { identity: 'fit person', current: 'meditate', new: 'exercise', time: '06:30', location: 'gym' },
  { identity: 'fit person', current: 'exercise', new: 'shower', time: '07:30', location: 'bathroom' },
  { identity: 'organized person', current: 'shower', new: 'make bed', time: '08:00', location: 'bedroom' },
  { identity: 'organized person', current: 'make bed', new: 'plan day', time: '08:10', location: 'desk' },
  { identity: 'productive person', current: 'plan day', new: 'check emails', time: '08:30', location: 'office' },
  { identity: 'productive person', current: 'check emails', new: 'deep work', time: '09:00', location: 'office' },
  { identity: 'focused person', current: 'deep work', new: 'take break', time: '11:00', location: 'outside' },
  { identity: 'healthy person', current: 'take break', new: 'eat lunch', time: '12:00', location: 'kitchen' },
  { identity: 'healthy person', current: 'eat lunch', new: 'walk', time: '12:30', location: 'park' },
  { identity: 'productive person', current: 'walk', new: 'work session', time: '13:00', location: 'office' },
  { identity: 'learner', current: 'work session', new: 'read', time: '15:00', location: 'library' },
  { identity: 'learner', current: 'read', new: 'take notes', time: '15:30', location: 'desk' },
  { identity: 'creative person', current: 'take notes', new: 'brainstorm', time: '16:00', location: 'office' },
  { identity: 'creative person', current: 'brainstorm', new: 'write', time: '16:30', location: 'desk' },
  { identity: 'social person', current: 'write', new: 'call friend', time: '17:00', location: 'phone' },
  { identity: 'organized person', current: 'call friend', new: 'tidy up', time: '17:30', location: 'home' },
  { identity: 'healthy person', current: 'tidy up', new: 'cook dinner', time: '18:00', location: 'kitchen' },
  { identity: 'mindful person', current: 'cook dinner', new: 'eat mindfully', time: '19:00', location: 'dining room' },
  { identity: 'family person', current: 'eat mindfully', new: 'family time', time: '19:30', location: 'living room' },
  { identity: 'learner', current: 'family time', new: 'study', time: '20:00', location: 'desk' },
  { identity: 'creative person', current: 'study', new: 'hobby time', time: '20:30', location: 'studio' },
  { identity: 'organized person', current: 'hobby time', new: 'prepare tomorrow', time: '21:00', location: 'bedroom' },
  { identity: 'grateful person', current: 'prepare tomorrow', new: 'journal', time: '21:15', location: 'desk' },
  { identity: 'mindful person', current: 'journal', new: 'gratitude practice', time: '21:30', location: 'bedroom' },
  { identity: 'healthy person', current: 'gratitude practice', new: 'skincare routine', time: '21:45', location: 'bathroom' },
  { identity: 'reader', current: 'skincare routine', new: 'read book', time: '22:00', location: 'bed' },
  { identity: 'healthy person', current: 'read book', new: 'sleep', time: '22:30', location: 'bedroom' }
];

async function generateTestData() {
  console.log('🚀 Starting test data generation...');
  
  for (let i = 0; i < testHabits.length; i++) {
    const habit = testHabits[i];
    const habitData = {
      identity: habit.identity,
      currentHabit: habit.current,
      newHabit: habit.new,
      time: habit.time,
      location: habit.location,
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streak: 0,
      completions: {},
      createdAt: new Date().toISOString()
    };
    
    console.log(`✅ ${i + 1}/30: ${habit.new}`);
    
    // Simulate the addHabit function call
    // You'll need to trigger this through your app's addHabit function
    window.postMessage({ type: 'ADD_HABIT', data: habitData }, '*');
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('✨ Test data generation complete!');
}

// Run the generator
generateTestData();
