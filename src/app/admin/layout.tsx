import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { Sidebar } from '@/components/shared/Sidebar'
import type { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="relative flex flex-1">
        <div className="absolute inset-0 bg-[url('/bg-layout.png')] bg-cover bg-center bg-no-repeat opacity-100 pointer-events-none" />

        <div className="relative z-10 flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
