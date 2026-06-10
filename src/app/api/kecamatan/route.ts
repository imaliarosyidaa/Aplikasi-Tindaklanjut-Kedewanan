import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const kotaNama = searchParams.get('kota')

  const where: Record<string, unknown> = {}
  if (kotaNama) {
    const kota = await prisma.kota.findFirst({ where: { nama: kotaNama } })
    if (kota) where.kota_id = kota.id
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
