import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { ReactNode } from 'react'

export default async function PengaturanLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roleRef: true },
  })

  if (user?.roleRef?.name !== 'Super Admin') redirect('/admin/dashboard')

  return <>{children}</>
}
