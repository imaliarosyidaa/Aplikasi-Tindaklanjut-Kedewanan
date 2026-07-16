'use client'
import React from 'react'

import { UserSidebar } from '@/components/shared/UserSidebar'
import { Link } from '@/routing'
import { MdAdminPanelSettings } from 'react-icons/md'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 items-center justify-between px-12">
          <div className="flex items-center justify-center gap-3 py-2">
            <img src="/Lambang_DPRD_Generik.png" alt="Logo" className="h-12 w-auto" />
            <img src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png" alt="Logo Text" className="h-12 w-auto" />
            <span className="text-lg font-bold text-[var(--color-primary)]">
              Dashboard Pengguna
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <MdAdminPanelSettings size={18} />
            Login Sebagai Admin
          </Link>
        </div>
      </nav>

      <div className="flex flex-1">
        <UserSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
