'use client'
import React, { useState } from 'react'

import { usePathname } from '@/routing'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Link } from '@/routing'
import { MdMenu, MdClose, MdLogout } from 'react-icons/md'
import { signOut } from 'next-auth/react'
export const Navbar = (): React.ReactNode => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/aspirasi', label: 'Tracing Aspirasi' },
    { href: '/admin/kunjungan/list', label: 'Daftar Kegiatan' },
    { href: '/admin/kunjungan/baru', label: 'Input Kegiatan' },
    { href: '/admin/relawan', label: 'Data Relawan' },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 items-center justify-between px-8">
        <div className="flex items-center justify-center gap-3 py-2">
        <img src="/Lambang_DPRD_Generik.png" alt="Logo" className="h-12 w-auto" />
          <img src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png" alt="Logo Text" className="h-12 w-auto" />
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/kegiatan'))
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
          <button
            onClick={() => {
              signOut({ callbackUrl: '/login' })
            }}
            className="hidden rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] md:block"
          >
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
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/kegiatan'))
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
