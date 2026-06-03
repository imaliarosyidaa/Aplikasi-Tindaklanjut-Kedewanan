'use client'
import React from 'react'

import { useTranslations } from 'next-intl'
import { usePathname } from '@/routing'
import { Link } from '@/routing'
import {
  MdTrackChanges,
  MdAdd,
  MdDashboard,
} from 'react-icons/md'
import { cn } from '@/utils/cn'

interface SidebarItem {
  href: string
  label: string
  icon: React.ReactNode
}

export const UserSidebar = (): React.ReactNode => {
  const t = useTranslations('Nav')
  const pathname = usePathname()

  const items: SidebarItem[] = [
    { href: '/dashboard', label: 'Beranda', icon: <MdDashboard size={20} /> },
    { href: '/dashboard/pengajuan-aspirasi', label: 'Pengajuan Aspirasi', icon: <MdAdd size={20} /> },
    { href: '/dashboard/laporan-saya', label: 'Laporan Saya', icon: <MdTrackChanges size={20} /> },
  ]

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:block">
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
