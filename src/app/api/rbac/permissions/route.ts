import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
  })
  return NextResponse.json(
    permissions.map((p) => ({
      id: p.id,
      name: p.name,
      resource: p.resource,
      action: p.action,
      description: p.description,
      created_at: p.createdAt.toISOString(),
    }))
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, resource, action, description } = body as {
    name?: string
    resource?: string
    action?: string
    description?: string
  }

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Nama permission wajib diisi' }, { status: 400 })
  }

  const exists = await prisma.permission.findUnique({ where: { name: name.trim() } })
  if (exists) {
    return NextResponse.json({ error: 'Permission dengan nama tersebut sudah ada' }, { status: 409 })
  }

  const created = await prisma.permission.create({
    data: {
      name: name.trim(),
      resource: resource ?? '',
      action: action ?? '',
      description: description ?? '',
    },
  })

  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      resource: created.resource,
      action: created.action,
      description: created.description,
      created_at: created.createdAt.toISOString(),
    },
    { status: 201 }
  )
}