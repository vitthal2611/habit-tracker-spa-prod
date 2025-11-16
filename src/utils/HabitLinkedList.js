class HabitNode {
  constructor(data) {
    this.id = data.id
    this.data = data
    this.next = null
    this.prev = null
  }
}

class HabitLinkedList {
  constructor() {
    this.head = null
    this.tail = null
    this.size = 0
  }

  add(habit) {
    const node = new HabitNode(habit)
    if (!this.head) {
      this.head = this.tail = node
    } else {
      this.tail.next = node
      node.prev = this.tail
      this.tail = node
    }
    this.size++
  }

  insertAfter(targetId, habit) {
    const node = new HabitNode(habit)
    let current = this.head
    while (current) {
      if (current.id === targetId) {
        const nextNode = current.next
        
        node.next = nextNode
        node.prev = current
        node.data.prevId = current.id
        node.data.nextId = nextNode?.id || null
        node.data.currentHabit = current.data.newHabit || current.data.habit
        node.data.stackAfter = current.id
        node.data.habitStatement = `After I ${node.data.currentHabit}, I will ${node.data.newHabit}`
        
        current.next = node
        current.data.nextId = node.id
        
        if (nextNode) {
          nextNode.prev = node
          nextNode.data.prevId = node.id
          nextNode.data.currentHabit = node.data.newHabit
          nextNode.data.stackAfter = node.id
          nextNode.data.habitStatement = `After I ${nextNode.data.currentHabit}, I will ${nextNode.data.newHabit}`
        } else {
          this.tail = node
        }
        
        this.size++
        return { prev: current.data, inserted: node.data, next: nextNode?.data }
      }
      current = current.next
    }
    return null
  }

  remove(id) {
    let current = this.head
    while (current) {
      if (current.id === id) {
        const prevNode = current.prev
        const nextNode = current.next
        const deletedHabitName = current.data.newHabit || current.data.habit
        
        if (prevNode) {
          prevNode.next = nextNode
          prevNode.data.nextId = nextNode?.id || null
        } else {
          this.head = nextNode
        }
        
        if (nextNode) {
          nextNode.prev = prevNode
          nextNode.data.prevId = prevNode?.id || null
          if (prevNode) {
            nextNode.data.currentHabit = prevNode.data.newHabit || prevNode.data.habit
            nextNode.data.stackAfter = prevNode.id
            nextNode.data.habitStatement = `After I ${nextNode.data.currentHabit}, I will ${nextNode.data.newHabit}`
          } else {
            nextNode.data.currentHabit = ''
            nextNode.data.stackAfter = null
            nextNode.data.habitStatement = `I will ${nextNode.data.newHabit}`
          }
        } else {
          this.tail = prevNode
        }
        
        this.size--
        return { 
          prev: prevNode?.data, 
          next: nextNode?.data, 
          deletedName: deletedHabitName,
          deletedId: id
        }
      }
      current = current.next
    }
    return null
  }

  find(id) {
    let current = this.head
    while (current) {
      if (current.id === id) return current.data
      current = current.next
    }
    return null
  }

  update(id, updatedHabit) {
    let current = this.head
    while (current) {
      if (current.id === id) {
        current.data = { ...current.data, ...updatedHabit }
        return true
      }
      current = current.next
    }
    return false
  }

  toArray() {
    const arr = []
    let current = this.head
    while (current) {
      arr.push({ ...current.data, nextId: current.next?.id, prevId: current.prev?.id })
      current = current.next
    }
    return arr
  }

  fromArray(habits) {
    this.head = this.tail = null
    this.size = 0
    
    const habitMap = new Map(habits.map(h => [h.id, h]))
    const sorted = []
    const visited = new Set()
    
    // Group by habitGroup
    const groups = { 'Morning': [], 'Afternoon': [], 'Evening': [], 'Night': [], 'Other': [] }
    habits.forEach(h => {
      const group = h.habitGroup || 'Other'
      groups[group].push(h)
    })
    
    // Build chains within each group using prevId/nextId
    Object.values(groups).forEach(groupHabits => {
      if (groupHabits.length === 0) return
      
      // Find head (no prevId)
      const heads = groupHabits.filter(h => !h.prevId || !habitMap.has(h.prevId))
      
      heads.forEach(head => {
        let current = head
        while (current && !visited.has(current.id)) {
          visited.add(current.id)
          sorted.push(current)
          current = current.nextId ? habitMap.get(current.nextId) : null
        }
      })
    })
    
    sorted.forEach(habit => this.add(habit))
  }

  getChain(id) {
    const chain = []
    let current = this.head
    let found = false
    while (current) {
      if (found || current.id === id) {
        chain.push(current.data)
        found = true
      }
      current = current.next
    }
    return chain
  }
}

export default HabitLinkedList
