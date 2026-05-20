'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { usePathname } from '@/routing'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Link } from '@/routing'
import { MdMenu, MdClose, MdLogout } from 'react-icons/md'
export const Navbar = (): React.ReactNode => {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/admin/dashboard', label: t('dashboard') },
    { href: '/admin/aspirasi', label: t('aspirasi') },
    { href: '/admin/kunjungan/list', label: t('kunjunganList') },
    { href: '/admin/kunjungan/baru', label: t('kunjunganBaru') },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/admin/dashboard"
          className="text-lg font-bold text-[var(--color-primary)]"
        >
          {t('dashboard')}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <button className="hidden rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] md:block">
            <MdLogout size={20} />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] md:hidden"
          >
            {mobileOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                pathname.startsWith(item.href)
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
