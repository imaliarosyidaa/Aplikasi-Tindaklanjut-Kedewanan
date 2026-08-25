import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const kotaId = searchParams.get('kota')
  const showAll = searchParams.get('all') === 'true'

  const where: Record<string, unknown> = {}
  if (kotaId) {
    where.kota_id = kotaId
  }
  if (!showAll) {
    where.flag = true
    where.kota = { flag: true }
  }

  const data = await prisma.kecamatan.findMany({
    where,
    include: {
      kelurahans: {
        orderBy: { nama: 'asc' },
      },
    },
    orderBy: { nama: 'asc' },
  })

  const result = data.map((k) => ({
    id: k.id,
    nama: k.nama,
    kota_id: k.kota_id,
    flag: k.flag,
    kelurahan: k.kelurahans.map((kel) => ({
      id: kel.id,
      nama: kel.nama,
    })),
  }))

  return NextResponse.json(result)
}
