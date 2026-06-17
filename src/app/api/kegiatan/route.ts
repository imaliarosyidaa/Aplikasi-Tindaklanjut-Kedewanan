import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const kelurahanNama = searchParams.get('kelurahan')
  const kunjunganId = searchParams.get('kunjungan_id')

  const where: Record<string, unknown> = {}

  if (kunjunganId) {
    where.kunjungan_id = kunjunganId
  }

  if (kelurahanNama) {
    const kelurahans = await prisma.kelurahan.findMany({
      where: { nama: kelurahanNama },
      select: { id: true },
    })
    const kelIds = kelurahans.map((k) => k.id)

    const kunjungans = await prisma.kunjungan.findMany({
      where: { kelurahan_id: { in: kelIds } },
      select: { id: true },
    })
    where.kunjungan_id = { in: kunjungans.map((k) => k.id) }
  }

  const data = await prisma.kegiatan.findMany({
    where,
    include: {
      kunjungan: {
        include: {
          kelurahan: true,
          kecamatan: true,
          kota: true,
        },
      },
    },
    orderBy: { tanggal: 'desc' },
  })

  const result = data.map((k) => ({
    id: k.id,
    jenis_kegiatan: k.jenis_kegiatan,
    kunjungan_id: k.kunjungan_id,
    isi: k.isi ?? '',
    hari: k.hari ?? '',
    tanggal: k.tanggal?.toISOString() ?? '',
    foto: k.foto ?? '',
    nama_kegiatan: k.nama_kegiatan,
    link_gmaps: k.link_gmaps ?? '',
    lokasi: k.tempat ?? '',
    rt: k.rt ?? '',
    rw: k.rw ?? '',
    jumlah_peserta: k.jumlah_peserta ?? 0,
    catatan: k.catatan ?? '',
    kelurahan: k.kunjungan.kelurahan.nama,
    kecamatan: k.kunjungan.kecamatan.nama,
    kota: k.kunjungan.kota.nama,
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const body = await request.json()

  const created = await prisma.kegiatan.create({
    data: {
      jenis_kegiatan: body.jenis_kegiatan ?? '',
      kunjungan_id: body.kunjungan_id,
      isi: body.isi ?? '',
      hari: body.hari ?? '',
      tanggal: body.tanggal ? new Date(body.tanggal) : null,
      foto: body.foto ?? '',
      nama_kegiatan: body.nama_kegiatan,
      link_gmaps: body.link_gmaps ?? '',
      tempat: body.tempat ?? '',
      alamat: body.alamat ?? '',
      rt: body.rt ?? '',
      rw: body.rw ?? '',
      jumlah_peserta: body.jumlah_peserta ? parseInt(body.jumlah_peserta) : null,
      catatan: body.catatan ?? '',
    },
    include: {
      kunjungan: {
        include: { kelurahan: true, kecamatan: true, kota: true },
      },
    },
  })

  return NextResponse.json({
    id: created.id,
    jenis_kegiatan: created.jenis_kegiatan,
    kunjungan_id: created.kunjungan_id,
    isi: created.isi ?? '',
    hari: created.hari ?? '',
    tanggal: created.tanggal?.toISOString() ?? '',
    foto: created.foto ?? '',
    nama_kegiatan: created.nama_kegiatan,
    link_gmaps: created.link_gmaps ?? '',
    lokasi: created.tempat ?? '',
    rt: created.rt ?? '',
    rw: created.rw ?? '',
    jumlah_peserta: created.jumlah_peserta ?? 0,
    catatan: created.catatan ?? '',
    kelurahan: created.kunjungan.kelurahan.nama,
    kecamatan: created.kunjungan.kecamatan.nama,
    kota: created.kunjungan.kota.nama,
  }, { status: 201 })
}
