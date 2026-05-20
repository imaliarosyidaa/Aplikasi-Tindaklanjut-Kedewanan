import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { Navbar } from '@/components/shared/Navbar'
import { Sidebar } from '@/components/shared/Sidebar'
import type { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const [session, locale] = await Promise.all([auth(), getLocale()])

  if (!session) {
    redirect(`/${locale}/login`)
  }

  if (session.user?.role !== 'admin') {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
