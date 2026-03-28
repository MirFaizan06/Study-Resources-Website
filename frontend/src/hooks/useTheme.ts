import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'orange' | 'orange-dark' | 'teal' | 'teal-dark' | 'rose' | 'rose-dark' | 'indigo' | 'indigo-dark' | 'emerald' | 'emerald-dark'
export const THEMES: Theme[] = ['orange', 'orange-dark', 'teal', 'teal-dark', 'rose', 'rose-dark', 'indigo', 'indigo-dark', 'emerald', 'emerald-dark', 'light', 'dark']
const VALID_THEMES = new Set<Theme>(['light', 'dark', 'orange', 'orange-dark', 'teal', 'teal-dark', 'rose', 'rose-dark', 'indigo', 'indigo-dark', 'emerald', 'emerald-dark'])

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored && VALID_THEMES.has(stored)) return stored
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
