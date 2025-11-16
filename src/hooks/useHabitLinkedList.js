import { useState, useEffect } from 'react'
import HabitLinkedList from '../utils/HabitLinkedList'

export const useHabitLinkedList = (initialHabits = []) => {
  const [list] = useState(() => {
    const habitList = new HabitLinkedList()
    habitList.fromArray(initialHabits)
    return habitList
  })
  const [habits, setHabits] = useState(list.toArray())

  useEffect(() => {
    list.fromArray(initialHabits)
    setHabits(list.toArray())
  }, [initialHabits])

  const addHabit = (habit) => {
    let result = null
    if (habit.stackAfter) {
      result = list.insertAfter(habit.stackAfter, habit)
    } else {
      list.add(habit)
    }
    setHabits(list.toArray())
    return result
  }

  const removeHabit = (id) => {
    const result = list.remove(id)
    setHabits(list.toArray())
    return result
  }

  const updateHabit = (id, updatedHabit) => {
    list.update(id, updatedHabit)
    setHabits(list.toArray())
  }

  const getHabitChain = (id) => {
    return list.getChain(id)
  }

  return {
    habits,
    addHabit,
    removeHabit,
    updateHabit,
    getHabitChain
  }
}
