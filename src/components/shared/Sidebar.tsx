'use client'
import React from 'react'

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
  const pathname = usePathname()

  const items: SidebarItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
    { href: '/admin/aspirasi', label: 'Tracing Aspirasi', icon: <MdTrackChanges size={20} /> },
    { href: '/admin/kunjungan', label: 'Daftar Kegiatan', icon: <MdList size={20} /> },
    { href: '/admin/kunjungan/baru', label: 'Input Kegiatan', icon: <MdAddLocation size={20} /> },
    { href: '/admin/relawan', label: 'Data Relawan', icon: <MdGroup size={20} /> },
  ]

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:block">
      <Link href="/admin/dashboard" className="flex h-16 items-center px-6 border-b border-[var(--color-border)]">
        <span className="font-bold text-[var(--color-text)]">
          Dashboard
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
