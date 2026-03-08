export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonHabitCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonTodoCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-3 animate-pulse">
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonTransactionRow() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
      <div className="h-5 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  )
}

export function SkeletonList({ count = 3, type = 'card' }) {
  const SkeletonComponent = {
    card: SkeletonCard,
    habit: SkeletonHabitCard,
    todo: SkeletonTodoCard,
    transaction: SkeletonTransactionRow
  }[type] || SkeletonCard

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  )
}
