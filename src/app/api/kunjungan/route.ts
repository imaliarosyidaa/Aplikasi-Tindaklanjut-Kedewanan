import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page')
  const hasPagination = pageParam !== null
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))

  const [data, total] = await Promise.all([
    prisma.kunjungan.findMany({
      orderBy: { created_at: 'desc' },
      ...(hasPagination ? { skip: (page - 1) * limit, take: limit } : {}),
      include: {
        kelurahan: true,
        kecamatan: true,
        kota: true,
      },
    }),
    prisma.kunjungan.count(),
  ])

  const result = data.map((k) => ({
    id: k.id,
    jenis_kegiatan: '',
    tanggal: k.tanggal.toISOString(),
    jam: k.jam,
    jalan: k.jalan,
    kelurahan: k.kelurahan.nama,
    kecamatan: k.kecamatan.nama,
    kota: k.kota.nama,
    link_gmaps: k.link_gmaps ?? '',
    created_at: k.created_at.toISOString(),
    updated_at: k.updated_at.toISOString(),
  }))

  return NextResponse.json(hasPagination ? { data: result, total, page, limit } : result)
}

export async function POST(request: Request) {
  const body = await request.json()

  const [kota, kecamatan, kelurahan] = await Promise.all([
    prisma.kota.findFirstOrThrow({ where: { nama: body.kota ?? 'Jakarta Selatan' } }),
    prisma.kecamatan.findFirstOrThrow({ where: { nama: body.kecamatan } }),
    prisma.kelurahan.findFirstOrThrow({ where: { nama: body.kelurahan } }),
  ])

  const created = await prisma.kunjungan.create({
    data: {
      tanggal: new Date(body.tanggal),
      jam: body.jam,
      jalan: body.jalan,
      kota_id: kota.id,
      kecamatan_id: kecamatan.id,
      kelurahan_id: kelurahan.id,
      link_gmaps: body.link_gmaps ?? '',
    },
    include: {
      kelurahan: true,
      kecamatan: true,
      kota: true,
    },
  })

  return NextResponse.json({
    id: created.id,
    tanggal: created.tanggal.toISOString(),
    jam: created.jam,
    jalan: created.jalan,
    kelurahan: created.kelurahan.nama,
    kecamatan: created.kecamatan.nama,
    kota: created.kota.nama,
    link_gmaps: created.link_gmaps ?? '',
    created_at: created.created_at.toISOString(),
    updated_at: created.updated_at.toISOString(),
  }, { status: 201 })
}
