import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const existing = await prisma.team.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Tim kerja tidak ditemukan' }, { status: 404 })
  }

  const updated = await prisma.team.update({
    where: { id },
    data: {
      name: body.name !== undefined ? (body.name?.trim() || existing.name) : existing.name,
      description:
        body.description !== undefined ? (body.description?.trim() ?? '') : existing.description,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : existing.is_active,
    },
  })

  return NextResponse.json({
    id: updated.id,
    dprd_id: updated.dprd_id,
    name: updated.name,
    description: updated.description,
    is_active: updated.is_active,
    created_at: updated.createdAt.toISOString(),
  })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const counts = await prisma.team.findUnique({
    where: { id },
    select: { _count: { select: { kegiatans: true, relawans: true, userTeams: true } } },
  })

  if (!counts) {
    return NextResponse.json({ error: 'Tim kerja tidak ditemukan' }, { status: 404 })
  }

  if (counts._count.kegiatans > 0 || counts._count.relawans > 0) {
    return NextResponse.json(
      { error: 'Tim kerja masih memiliki data kegiatan/relawan. Pindahkan atau hapus datanya terlebih dahulu.' },
      { status: 409 },
    )
  }

  await prisma.team.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
