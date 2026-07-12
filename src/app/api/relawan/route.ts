import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.relawan.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
    },
  })

  const result = data.map((r) => ({
    id: r.id,
    nik: r.nik ?? '',
    nama: r.nama,
    no_telepon: r.no_telepon ?? '',
    jenis_kelamin: r.jenis_kelamin,
    kota_kabupaten: r.kota.nama,
    kecamatan: r.kecamatan.nama,
    kelurahan: r.kelurahan.nama,
    alamat: r.alamat,
    domisili_sekarang: r.domisili_sekarang ?? '',
    posisi: r.posisi,
    foto: r.foto ?? '',
    created_at: r.created_at.toISOString(),
    updated_at: r.updated_at.toISOString(),
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const body = await request.json()

  const [kota, kecamatan, kelurahan] = await Promise.all([
    prisma.kota.findFirstOrThrow({ where: { nama: body.kota_kabupaten } }),
    prisma.kecamatan.findFirstOrThrow({ where: { nama: body.kecamatan } }),
    prisma.kelurahan.findFirstOrThrow({ where: { nama: body.kelurahan } }),
  ])

  const created = await prisma.relawan.create({
    data: {
      nik: body.nik,
      nama: body.nama,
      no_telepon: body.no_telepon,
      jenis_kelamin: body.jenis_kelamin,
      alamat: body.alamat,
      domisili_sekarang: body.domisili_sekarang ?? '',
      posisi: body.posisi,
      foto: body.foto ?? '',
      kota_id: kota.id,
      kecamatan_id: kecamatan.id,
      kelurahan_id: kelurahan.id,
    },
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
    },
  })

  return NextResponse.json({
    id: created.id,
    nik: created.nik ?? '',
    nama: created.nama,
    no_telepon: created.no_telepon ?? '',
    jenis_kelamin: created.jenis_kelamin,
    kota_kabupaten: created.kota.nama,
    kecamatan: created.kecamatan.nama,
    kelurahan: created.kelurahan.nama,
    alamat: created.alamat,
    domisili_sekarang: created.domisili_sekarang ?? '',
    posisi: created.posisi,
    foto: created.foto ?? '',
    created_at: created.created_at.toISOString(),
    updated_at: created.updated_at.toISOString(),
  }, { status: 201 })
}
