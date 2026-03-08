import { useEffect } from 'react'

export function useKeyboardShortcut(key, callback, options = {}) {
  const { ctrl = false, shift = false, alt = false, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e) => {
      const isCtrlPressed = e.ctrlKey || e.metaKey
      const isShiftPressed = e.shiftKey
      const isAltPressed = e.altKey
      const pressedKey = e.key.toLowerCase()

      if (
        pressedKey === key.toLowerCase() &&
        isCtrlPressed === ctrl &&
        isShiftPressed === shift &&
        isAltPressed === alt
      ) {
        e.preventDefault()
        callback(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, ctrl, shift, alt, enabled])
}

export function useGlobalShortcuts(activeModule, onModuleChange, onToggleDarkMode, onShowShortcuts) {
  useKeyboardShortcut('1', () => onModuleChange('habits'), { ctrl: true })
  useKeyboardShortcut('2', () => onModuleChange('todos'), { ctrl: true })
  useKeyboardShortcut('3', () => onModuleChange('expenses'), { ctrl: true })
  useKeyboardShortcut('d', onToggleDarkMode, { ctrl: true })
  useKeyboardShortcut('/', onShowShortcuts, { ctrl: true })
}
