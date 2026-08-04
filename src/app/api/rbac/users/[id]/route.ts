import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  }

  const roleRef = body.role_id ? await prisma.role.findUnique({ where: { id: body.role_id } }) : null
  if (body.role_id && !roleRef) {
    return NextResponse.json({ error: 'Role tidak ditemukan' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      email: body.email !== undefined ? (body.email?.trim() || null) : existing.email,
      name: body.name !== undefined ? (body.name as string) : existing.name,
      role: body.role ?? existing.role,
      role_id: body.role_id !== undefined ? (body.role_id || null) : existing.role_id,
    },
    include: { roleRef: true },
  })

  return NextResponse.json({
    id: updated.id,
    username: updated.username,
    email: updated.email ?? '',
    name: updated.name,
    role: updated.role,
    role_id: updated.role_id ?? '',
    role_name: updated.roleRef?.name ?? '',
    created_at: updated.createdAt.toISOString(),
  })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 })
  }
}