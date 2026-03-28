import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'orange' | 'orange-dark'
export const THEMES: Theme[] = ['orange', 'orange-dark', 'light', 'dark']

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark' || stored === 'orange' || stored === 'orange-dark') return stored
    return 'orange' // default
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  return { theme, setTheme }
}
