import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const kecamatanId = searchParams.get('kecamatan')

  const where: Record<string, unknown> = {}
  if (kecamatanId) {
    where.kecamatan_id = kecamatanId
  }

  const data = await prisma.kelurahan.findMany({
    where,
    orderBy: { nama: 'asc' },
  })

  const result = data.map((k) => ({ id: k.id, nama: k.nama }))
  return NextResponse.json(result)
}
