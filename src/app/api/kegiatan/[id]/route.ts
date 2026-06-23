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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updated = await prisma.kegiatan.update({
    where: { id },
    data: {
      nama_kegiatan: body.nama_kegiatan,
      tempat: body.lokasi,
      catatan: body.catatan,
      rt: body.rt,
      rw: body.rw,
      jumlah_peserta: body.jumlah_peserta ? Number(body.jumlah_peserta) : undefined,
      link_gmaps: body.link_gmaps,
      tanggal: body.tanggal ? new Date(body.tanggal) : undefined,
    },
    include: {
      kunjungan: {
        include: { kelurahan: true, kecamatan: true, kota: true },
      },
    },
  })

  return NextResponse.json({
    id: updated.id,
    nama_kegiatan: updated.nama_kegiatan,
    lokasi: updated.tempat ?? '',
    catatan: updated.catatan ?? '',
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.kegiatan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
