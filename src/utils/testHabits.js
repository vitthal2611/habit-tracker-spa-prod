// Test habits data for development
export const generateTestHabits = () => {
  const identities = ['Reader', 'Athlete', 'Writer', 'Learner', 'Healthy Person', 'Organized Person', 'Creative', 'Mindful Person', 'Productive Person', 'Social Person']
  const currentHabits = ['wake up', 'brush my teeth', 'have coffee', 'check my phone', 'eat breakfast', 'get dressed', 'sit at my desk', 'open my laptop', 'finish work', 'eat dinner']
  const locations = ['bedroom', 'kitchen', 'living room', 'office', 'gym', 'park', 'library', 'coffee shop', 'bathroom', 'car']
  
  const habits = [
    { identity: 'Reader', currentHabit: 'have coffee', newHabit: 'read for 10 minutes', location: 'living room', time: '07:00', completionTime: '10 minutes' },
    { identity: 'Athlete', currentHabit: 'wake up', newHabit: 'do 20 push-ups', location: 'bedroom', time: '06:30', completionTime: '5 minutes' },
    { identity: 'Writer', currentHabit: 'sit at my desk', newHabit: 'write 200 words', location: 'office', time: '09:00', completionTime: '15 minutes' },
    { identity: 'Learner', currentHabit: 'eat breakfast', newHabit: 'study Spanish for 15 minutes', location: 'kitchen', time: '08:00', completionTime: '15 minutes' },
    { identity: 'Healthy Person', currentHabit: 'brush my teeth', newHabit: 'drink a glass of water', location: 'bathroom', time: '06:45', completionTime: '2 minutes' },
    { identity: 'Organized Person', currentHabit: 'get dressed', newHabit: 'make my bed', location: 'bedroom', time: '07:15', completionTime: '3 minutes' },
    { identity: 'Creative', currentHabit: 'finish work', newHabit: 'sketch for 10 minutes', location: 'office', time: '17:30', completionTime: '10 minutes' },
    { identity: 'Mindful Person', currentHabit: 'wake up', newHabit: 'meditate for 5 minutes', location: 'bedroom', time: '06:00', completionTime: '5 minutes' },
    { identity: 'Productive Person', currentHabit: 'open my laptop', newHabit: 'review my daily goals', location: 'office', time: '09:15', completionTime: '5 minutes' },
    { identity: 'Social Person', currentHabit: 'eat dinner', newHabit: 'call a friend', location: 'living room', time: '19:00', completionTime: '10 minutes' },
    { identity: 'Athlete', currentHabit: 'check my phone', newHabit: 'do 50 jumping jacks', location: 'living room', time: '07:30', completionTime: '3 minutes' },
    { identity: 'Reader', currentHabit: 'eat dinner', newHabit: 'read one article', location: 'kitchen', time: '18:30', completionTime: '8 minutes' },
    { identity: 'Healthy Person', currentHabit: 'sit at my desk', newHabit: 'take a 5-minute walk', location: 'office', time: '10:00', completionTime: '5 minutes' },
    { identity: 'Writer', currentHabit: 'have coffee', newHabit: 'write in my journal', location: 'kitchen', time: '07:45', completionTime: '10 minutes' },
    { identity: 'Learner', currentHabit: 'finish work', newHabit: 'watch an educational video', location: 'living room', time: '18:00', completionTime: '20 minutes' },
    { identity: 'Organized Person', currentHabit: 'eat breakfast', newHabit: 'plan my day', location: 'kitchen', time: '08:15', completionTime: '5 minutes' },
    { identity: 'Creative', currentHabit: 'wake up', newHabit: 'take a creative photo', location: 'bedroom', time: '06:15', completionTime: '3 minutes' },
    { identity: 'Mindful Person', currentHabit: 'eat dinner', newHabit: 'practice gratitude', location: 'kitchen', time: '19:15', completionTime: '5 minutes' },
    { identity: 'Productive Person', currentHabit: 'check my phone', newHabit: 'delete 5 unnecessary files', location: 'office', time: '09:30', completionTime: '3 minutes' },
    { identity: 'Social Person', currentHabit: 'have coffee', newHabit: 'send a positive message', location: 'kitchen', time: '07:20', completionTime: '2 minutes' },
    { identity: 'Athlete', currentHabit: 'eat breakfast', newHabit: 'stretch for 10 minutes', location: 'living room', time: '08:30', completionTime: '10 minutes' },
    { identity: 'Reader', currentHabit: 'get dressed', newHabit: 'read news headlines', location: 'bedroom', time: '07:25', completionTime: '5 minutes' },
    { identity: 'Healthy Person', currentHabit: 'open my laptop', newHabit: 'eat a piece of fruit', location: 'office', time: '09:45', completionTime: '3 minutes' },
    { identity: 'Writer', currentHabit: 'eat dinner', newHabit: 'write down 3 ideas', location: 'kitchen', time: '19:30', completionTime: '5 minutes' },
    { identity: 'Learner', currentHabit: 'brush my teeth', newHabit: 'learn 5 new words', location: 'bathroom', time: '21:00', completionTime: '7 minutes' },
    { identity: 'Organized Person', currentHabit: 'finish work', newHabit: 'tidy my workspace', location: 'office', time: '17:00', completionTime: '5 minutes' },
    { identity: 'Creative', currentHabit: 'sit at my desk', newHabit: 'brainstorm for 5 minutes', location: 'office', time: '10:30', completionTime: '5 minutes' },
    { identity: 'Mindful Person', currentHabit: 'get dressed', newHabit: 'take 5 deep breaths', location: 'bedroom', time: '07:10', completionTime: '2 minutes' },
    { identity: 'Productive Person', currentHabit: 'eat breakfast', newHabit: 'prioritize top 3 tasks', location: 'kitchen', time: '08:45', completionTime: '5 minutes' },
    { identity: 'Social Person', currentHabit: 'finish work', newHabit: 'compliment someone', location: 'office', time: '17:15', completionTime: '1 minute' },
    { identity: 'Athlete', currentHabit: 'brush my teeth', newHabit: 'do wall sits for 30 seconds', location: 'bathroom', time: '21:15', completionTime: '1 minute' },
    { identity: 'Reader', currentHabit: 'open my laptop', newHabit: 'read a motivational quote', location: 'office', time: '09:05', completionTime: '2 minutes' },
    { identity: 'Healthy Person', currentHabit: 'finish work', newHabit: 'drink herbal tea', location: 'kitchen', time: '17:45', completionTime: '5 minutes' },
    { identity: 'Writer', currentHabit: 'wake up', newHabit: 'write morning pages', location: 'bedroom', time: '06:45', completionTime: '15 minutes' },
    { identity: 'Learner', currentHabit: 'sit at my desk', newHabit: 'read industry news', location: 'office', time: '11:00', completionTime: '10 minutes' },
    { identity: 'Organized Person', currentHabit: 'have coffee', newHabit: 'review my calendar', location: 'kitchen', time: '07:50', completionTime: '3 minutes' },
    { identity: 'Creative', currentHabit: 'eat breakfast', newHabit: 'listen to inspiring music', location: 'kitchen', time: '08:20', completionTime: '5 minutes' },
    { identity: 'Mindful Person', currentHabit: 'check my phone', newHabit: 'set a positive intention', location: 'bedroom', time: '06:50', completionTime: '2 minutes' },
    { identity: 'Productive Person', currentHabit: 'get dressed', newHabit: 'visualize my success', location: 'bedroom', time: '07:05', completionTime: '3 minutes' },
    { identity: 'Social Person', currentHabit: 'open my laptop', newHabit: 'check in with my team', location: 'office', time: '09:20', completionTime: '5 minutes' },
    { identity: 'Athlete', currentHabit: 'eat dinner', newHabit: 'do yoga poses', location: 'living room', time: '19:45', completionTime: '15 minutes' },
    { identity: 'Reader', currentHabit: 'finish work', newHabit: 'read a book chapter', location: 'living room', time: '18:15', completionTime: '25 minutes' },
    { identity: 'Healthy Person', currentHabit: 'get dressed', newHabit: 'take vitamins', location: 'kitchen', time: '07:30', completionTime: '1 minute' },
    { identity: 'Writer', currentHabit: 'check my phone', newHabit: 'capture a random thought', location: 'bedroom', time: '06:55', completionTime: '2 minutes' },
    { identity: 'Learner', currentHabit: 'eat dinner', newHabit: 'practice a skill', location: 'living room', time: '20:00', completionTime: '20 minutes' },
    { identity: 'Organized Person', currentHabit: 'open my laptop', newHabit: 'clear my email inbox', location: 'office', time: '09:10', completionTime: '10 minutes' },
    { identity: 'Creative', currentHabit: 'have coffee', newHabit: 'doodle in my notebook', location: 'kitchen', time: '07:35', completionTime: '5 minutes' },
    { identity: 'Mindful Person', currentHabit: 'sit at my desk', newHabit: 'practice mindful breathing', location: 'office', time: '11:30', completionTime: '3 minutes' },
    { identity: 'Productive Person', currentHabit: 'eat dinner', newHabit: 'reflect on my achievements', location: 'kitchen', time: '20:15', completionTime: '5 minutes' },
    { identity: 'Social Person', currentHabit: 'brush my teeth', newHabit: 'plan tomorrow\'s connections', location: 'bathroom', time: '21:30', completionTime: '3 minutes' }
  ]

  return habits.map((habit, index) => ({
    ...habit,
    id: `habit_${Date.now()}_${index}`,
    completed: false,
    streak: Math.floor(Math.random() * 15),
    completions: {},
    schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    createdAt: new Date().toISOString()
  }))
}