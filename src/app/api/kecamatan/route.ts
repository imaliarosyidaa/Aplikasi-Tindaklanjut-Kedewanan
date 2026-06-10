import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const kotaId = searchParams.get('kota')

  const where: Record<string, unknown> = {}
  if (kotaId) {
    where.kota_id = kotaId
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
    kelurahan: k.kelurahans.map((kel) => ({
      id: kel.id,
      nama: kel.nama,
    })),
  }))

  return NextResponse.json(result)
}
