import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const k = await prisma.kegiatan.findUnique({
    where: { id },
    include: {
      kunjungan: {
        include: {
          kelurahan: true,
          kecamatan: true,
          kota: true,
        },
      },
    },
  })

  if (!k) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
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
  })
}
