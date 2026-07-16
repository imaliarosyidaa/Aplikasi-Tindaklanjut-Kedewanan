import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { ids } = await request.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids harus array tidak kosong' }, { status: 400 })
  }

  const kegiatanList = await prisma.kegiatan.findMany({
    where: { id: { in: ids } },
    select: { kunjungan_id: true },
  })
  const kunjunganIds = [...new Set(kegiatanList.map((k) => k.kunjungan_id))]

  await prisma.$transaction([
    prisma.kegiatan.deleteMany({ where: { id: { in: ids } } }),
    prisma.kunjungan.deleteMany({ where: { id: { in: kunjunganIds } } }),
  ])
  return NextResponse.json({ deleted: ids.length })
}
