import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const permission_ids: string[] = Array.isArray(body.permission_ids)
    ? (body.permission_ids as string[])
    : []

  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    return NextResponse.json({ error: 'Role tidak ditemukan' }, { status: 404 })
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId: id } })
    if (permission_ids.length) {
      await tx.rolePermission.createMany({
        data: permission_ids.map((permissionId) => ({ roleId: id, permissionId })),
      })
    }
    return tx.role.update({
      where: { id },
      data: { description: body.description ?? role.description },
      include: { permissions: { include: { permission: true } } },
    })
  })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    permission_ids: updated.permissions.map((rp) => rp.permissionId),
  })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.role.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus role' }, { status: 500 })
  }
}