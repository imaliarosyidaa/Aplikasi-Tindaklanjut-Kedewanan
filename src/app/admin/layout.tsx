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

        <div className="relative flex flex-1 overflow-hidden">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0" />

          {/* Grid Background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 39px,
                  var(--color-grid) 39px,
                  var(--color-grid) 40px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 39px,
                  var(--color-grid) 39px,
                  var(--color-grid) 40px
                )
              `,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex min-w-0 w-full flex-1 justify-center px-4 sm:px-6 lg:px-8">
            {/* <Sidebar /> */}

            <main className="min-w-0 w-full max-w-7xl flex-1 py-6">{children}</main>
          </div>
        </div>
      </SessionProvider>
    </div>
  )
}
