import { UserSidebar } from '@/components/shared/UserSidebar'
import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-lg font-bold text-[var(--color-primary)]">
            Dashboard Pengguna
          </span>
        </div>
      </nav>
      <div className="flex flex-1">
        <UserSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
