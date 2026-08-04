'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from '@/routing'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Link } from '@/routing'
import {
  MdMenu,
  MdClose,
  MdLogout,
  MdSettings,
  MdPerson,
  MdKeyboardArrowDown,
} from 'react-icons/md'
import { signOut, useSession } from 'next-auth/react'

export const Navbar = (): React.ReactNode => {
  const pathname = usePathname()
  const { data: session } = useSession()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isSuperAdmin = session?.user?.roleName === 'Super Admin'

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/aspirasi', label: 'Daftar Aspirasi' },
    { href: '/admin/kunjungan', label: 'Daftar Kegiatan' },
    { href: '/admin/kunjungan/baru', label: 'Input Kegiatan' },
    { href: '/admin/relawan', label: 'Data Relawan' },
  ]

  // Event listener untuk menutup dropdown ketika diklik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = '/login'
  }

  return (
    <nav className="relative top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 items-center justify-between px-8">
        {/* LOGO AREA */}
        <div className="flex items-center justify-center gap-3 py-2">
          <img
            src="/Lambang_DPRD_Generik.png"
            alt="Logo DPRD"
            className="h-12 w-auto"
          />
          <img
            src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png"
            alt="Logo Partai"
            className="h-12 w-auto"
          />
        </div>

        {/* NAVIGATION ITEMS (DESKTOP) */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href ||
                  (item.href !== '/' &&
                    pathname.startsWith(item.href + '/kegiatan'))
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* ACTION BUTTONS & DROPDOWN */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {/* ADMIN PROFILE DROPDOWN (DESKTOP) */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 pl-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-secondary)]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold text-xs">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <MdPerson size={16} />}
              </div>
              <span className="max-w-[120px] truncate text-xs font-semibold">
                {session?.user?.name || 'Administrator'}
              </span>
              <MdKeyboardArrowDown
                size={18}
                className={`text-[var(--color-text-secondary)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* DROPDOWN MENU */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 shadow-lg transition-all">
                <div className="border-b border-[var(--color-border)] px-3 py-2">
                  <p className="text-xs font-semibold text-[var(--color-text)]">
                    {session?.user?.name || 'Admin'}
                  </p>
                  <p className="truncate text-[10px] text-[var(--color-text-secondary)]">
                    {session?.user?.email || 'admin@dprd.go.id'}
                  </p>
                </div>

                <div className="py-1">
                  {isSuperAdmin && (
                    <Link
                      href="/admin/pengaturan"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-secondary)]"
                    >
                      <MdSettings size={16} className="text-[var(--color-text-secondary)]" />
                      Pengaturan
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <MdLogout size={16} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="cursor-pointer rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] md:hidden"
          >
            {mobileOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="space-y-1 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href + '/kegiatan'))
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-2 mt-2 border-t border-[var(--color-border)] space-y-1">
            {isSuperAdmin && (
              <Link
                href="/admin/pengaturan"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
              >
                <MdSettings size={18} />
                Pengaturan
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <MdLogout size={18} />
              Keluar
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}