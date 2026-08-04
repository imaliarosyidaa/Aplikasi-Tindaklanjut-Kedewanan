import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { Sidebar } from '@/components/shared/Sidebar'
import type { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

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
      <SessionProvider>
      <Navbar />
      <div className="relative flex flex-1">
        <div className="absolute inset-0 bg-[#F8FBFF] bg-cover bg-center bg-no-repeat opacity-100 pointer-events-none" />

          {/* 🛠️ Tambahkan w-full dan min-w-0 di pembungkus flex utama */}
          <div className="relative z-10 flex w-full flex-1 justify-center min-w-0 px-4 sm:px-6 lg:px-8">
            {/* <Sidebar /> */}

            {/* 🛠️ Main diset w-full dan min-w-0 agar tabel di dalam children bisa menyesuaikan scrollbar-nya */}
            <main className="w-full max-w-7xl flex-1 py-6 min-w-0">
              {children}
            </main>
          </div>
      </div>
      </SessionProvider>
    </div>
  )
}
