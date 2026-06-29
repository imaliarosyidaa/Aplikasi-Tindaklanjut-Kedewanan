'use client'
import React from 'react'

import { useTranslations } from 'next-intl'
import { usePathname } from '@/routing'
import { Link } from '@/routing'
import {
  MdDashboard,
  MdTrackChanges,
  MdDirectionsWalk,
  MdAddLocation,
  MdList,
  MdGroup,
} from 'react-icons/md'
import { cn } from '@/utils/cn'
interface SidebarItem {
  href: string
  label: string
  icon: React.ReactNode
}

export const Sidebar = (): React.ReactNode => {
  const t = useTranslations('Nav')
  const pathname = usePathname()

  const items: SidebarItem[] = [
    { href: '/admin/dashboard', label: t('dashboard'), icon: <MdDashboard size={20} /> },
    { href: '/admin/aspirasi', label: t('aspirasi'), icon: <MdTrackChanges size={20} /> },
    { href: '/admin/kunjungan', label: t('kunjunganList'), icon: <MdList size={20} /> },
    { href: '/admin/kunjungan/baru', label: t('kunjunganBaru'), icon: <MdAddLocation size={20} /> },
    { href: '/admin/relawan', label: t('relawan'), icon: <MdGroup size={20} /> },
  ]

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:block">
      <Link href="/admin/dashboard" className="flex h-16 items-center px-6 border-b border-[var(--color-border)]">
        <MdDirectionsWalk size={24} className="text-[var(--color-primary)] mr-2" />
        <span className="font-bold text-[var(--color-text)]">
          {t('dashboard')}
        </span>
      </Link>
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/kegiatan'))
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
