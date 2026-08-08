'use client'

import React, { useState } from 'react'
import { Link, usePathname } from '@/routing'
import { MdAdd, MdClose, MdLock, MdMenu, MdTrackChanges } from 'react-icons/md'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import Footer from '@/components/shared/Footer'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Pengajuan Aspirasi', icon: <MdAdd size={20} /> },
    {
      href: '/laporan-saya',
      label: 'Laporan Saya',
      icon: <MdTrackChanges size={20} />,
    },
  ]

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {/* 🛠️ PERBAIKAN: sticky top-0 & z-50 agar navbar selalu di atas */}
        <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo & Desktop Nav Items */}
            <div className="flex items-center gap-3 py-2">
              <img src="/Lambang_DPRD_Generik.png" alt="Logo DPRD" className="h-8 w-auto sm:h-10 md:h-12" />
              <img
                src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png"
                alt="Logo PDIP"
                className="h-8 w-auto sm:h-10 md:h-12"
              />

              {/* Desktop Navigation */}
              <div className="ml-2 hidden items-center gap-1 md:flex">
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
            </div>

            {/* Right Action Items */}
            <div className="flex items-center gap-2">
              <ThemeSwitcher />

              {/* Tombol Login Admin (Desktop / Tablet) */}
              <button
                onClick={() => {
                  window.location.href = '/login'
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 sm:text-sm"
                title="Login sebagai admin"
              >
                <MdLock size={18} />
                <span className="hidden sm:inline">Login Admin</span>
              </button>

              {/* Hamburger Button untuk Mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="cursor-pointer rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] md:hidden"
                aria-label="Toggle Menu"
              >
                {mobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Dropdown Menu Mobile */}
          {mobileOpen && (
            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 shadow-lg md:hidden">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/kegiatan'))
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}

                <div className="pt-2 sm:hidden">
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      window.location.href = '/login'
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    <MdLock size={18} />
                    Login Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </>
  )
}
