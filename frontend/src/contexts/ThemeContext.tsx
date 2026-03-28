import React, { createContext, useContext } from 'react'
import { useTheme, type Theme } from '@/hooks/useTheme'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { theme, toggleTheme } = useTheme()

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext)
}
