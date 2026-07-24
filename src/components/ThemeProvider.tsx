'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Theme } from '@/types'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    return { theme: 'light' as Theme, setTheme: () => {}, themes: [] as Theme[] }
  }
  return context
}

const ALL_THEMES: Theme[] = ['light', 'dark', 'yellow', 'ramadan', 'valentine']

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
}: {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  const applyTheme = useCallback(
    (newTheme: Theme) => {
      const root = document.documentElement
      root.classList.remove(...ALL_THEMES)
      if (newTheme && newTheme !== 'light') {
        root.classList.add(newTheme)
      }
    },
    []
  )

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey) as Theme | null
    const resolved = stored && ALL_THEMES.includes(stored) ? stored : defaultTheme
    setThemeState(resolved)
    applyTheme(resolved)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (!ALL_THEMES.includes(newTheme)) return
      setThemeState(newTheme)
      applyTheme(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // localStorage unavailable
      }
    },
    [applyTheme, storageKey]
  )

  const value: ThemeContextType = { theme: mounted ? theme : defaultTheme, setTheme, themes: ALL_THEMES }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
