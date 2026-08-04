import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        permissions: { include: { permission: true } },
      },
    }),
    prisma.permission.findMany({ orderBy: { resource: 'asc' } }),
  ])

  const roleResult = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    created_at: r.createdAt.toISOString(),
    permission_ids: r.permissions.map((rp) => rp.permissionId),
    permission_count: r.permissions.length,
  }))

  return NextResponse.json({ roles: roleResult, permissions })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, description, permission_ids } = body as {
    name?: string
    description?: string
    permission_ids?: string[]
  }

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Nama role wajib diisi' }, { status: 400 })
  }

  const exists = await prisma.role.findUnique({ where: { name: name.trim() } })
  if (exists) {
    return NextResponse.json({ error: 'Role dengan nama tersebut sudah ada' }, { status: 409 })
  }

  const role = await prisma.role.create({
    data: {
      name: name.trim(),
      description: description ?? '',
      permissions: (permission_ids ?? []).length
        ? {
            create: (permission_ids ?? []).map((pid: string) => ({ permissionId: pid })),
          }
        : undefined,
    },
    include: { permissions: { include: { permission: true } } },
  })

  return NextResponse.json(
    {
      id: role.id,
      name: role.name,
      description: role.description,
      created_at: role.createdAt.toISOString(),
      permission_ids: role.permissions.map((rp) => rp.permissionId),
    },
    { status: 201 }
  )
}