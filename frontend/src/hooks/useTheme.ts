import { useState, useEffect, useCallback } from 'react'

export type Theme = 'orange' | 'rose-dark' | 'discord-dark'
export const THEMES: Theme[] = ['orange', 'rose-dark', 'discord-dark']
const VALID_THEMES = new Set<Theme>(['orange', 'rose-dark', 'discord-dark'])

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored && VALID_THEMES.has(stored)) return stored
    return 'discord-dark' // default
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
