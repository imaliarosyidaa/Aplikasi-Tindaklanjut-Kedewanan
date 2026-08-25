import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.kecamatan.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Kecamatan tidak ditemukan' }, { status: 404 })
  }

  if (body.flag === undefined) {
    return NextResponse.json({ error: 'flag wajib diisi' }, { status: 400 })
  }

  const updated = await prisma.kecamatan.update({
    where: { id },
    data: { flag: Boolean(body.flag) },
  })

  return NextResponse.json({
    id: updated.id,
    nama: updated.nama,
    flag: updated.flag,
  })
}
