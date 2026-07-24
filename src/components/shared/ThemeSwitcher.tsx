'use client'
import React from 'react'

import { useTheme } from '@/components/ThemeProvider'
import { useEffect, useState } from 'react'
import { MdLightMode, MdDarkMode, MdOutlineWbSunny, MdMosque, MdFavorite } from 'react-icons/md'
import { cn } from '@/utils/cn'
import type { Theme } from '@/types'
const themeIcons: Record<Theme, React.ReactNode> = {
  light: <MdLightMode size={18} />,
  dark: <MdDarkMode size={18} />,
  yellow: <MdOutlineWbSunny size={18} />,
  ramadan: <MdMosque size={18} />,
  valentine: <MdFavorite size={18} />,
}

const themes: Theme[] = ['light', 'dark', 'yellow', 'ramadan', 'valentine']

export const ThemeSwitcher = (): React.ReactNode => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex gap-1">
        {themes.map((t) => (
          <div key={t} className="h-8 w-8 rounded-lg opacity-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-1">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={cn(
            'cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
            theme === t
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
          )}
          title={t}
        >
          {themeIcons[t]}
        </button>
      ))}
    </div>
  )
}
