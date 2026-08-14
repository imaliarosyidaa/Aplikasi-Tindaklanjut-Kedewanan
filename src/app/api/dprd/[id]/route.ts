import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const existing = await prisma.dprd.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'DPRD tidak ditemukan' }, { status: 404 })
  }

  if (body.name !== undefined) {
    const name = body.name?.trim()
    if (!name) {
      return NextResponse.json({ error: 'Nama DPRD wajib diisi' }, { status: 400 })
    }
    const dup = await prisma.dprd.findFirst({ where: { name, NOT: { id } } })
    if (dup) {
      return NextResponse.json({ error: 'Nama DPRD sudah terdaftar' }, { status: 409 })
    }
  }

  const updated = await prisma.dprd.update({
    where: { id },
    data: {
      name: body.name !== undefined ? body.name?.trim() : existing.name,
      description: body.description !== undefined ? (body.description?.trim() ?? '') : existing.description,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : existing.is_active,
    },
  })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    is_active: updated.is_active,
    created_at: updated.createdAt.toISOString(),
    updated_at: updated.updatedAt.toISOString(),
  })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const teams = await prisma.team.findMany({ where: { dprd_id: id }, select: { id: true } })
  if (teams.length > 0) {
    return NextResponse.json(
      { error: 'DPRD masih memiliki tim kerja. Hapus tim terlebih dahulu.' },
      { status: 409 },
    )
  }

  await prisma.dprd.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
