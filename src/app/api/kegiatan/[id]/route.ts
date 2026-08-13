import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDataScope, teamFilter } from '@/lib/scoping'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const scope = await getDataScope()

  const k = await prisma.kegiatan.findFirst({
    where: { id, ...teamFilter(scope) },
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
    jam: k.kunjungan.jam ?? '',
    foto: k.foto,
    nama_kegiatan: k.nama_kegiatan,
    link_gmaps: k.link_gmaps ?? '',
    tempat: k.tempat ?? '',
    alamat: k.alamat ?? '',
    rt: k.rt ?? '',
    rw: k.rw ?? '',
    jumlah_peserta: k.jumlah_peserta ?? 0,
    catatan: k.catatan ?? '',
    kelurahan: k.kunjungan.kelurahan.nama,
    kecamatan: k.kunjungan.kecamatan.nama,
    kota: k.kunjungan.kota.nama,
    kunjungan: {
      jalan: k.kunjungan.jalan ?? '',
      kota_id: k.kunjungan.kota_id,
      kecamatan_id: k.kunjungan.kecamatan_id,
      kelurahan_id: k.kunjungan.kelurahan_id,
      link_gmaps: k.kunjungan.link_gmaps ?? '',
    },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const scope = await getDataScope()
  const existing = await prisma.kegiatan.findFirst({ where: { id, ...teamFilter(scope) } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  const fotoVal =
    body.foto !== undefined ? (Array.isArray(body.foto) ? JSON.stringify(body.foto) : body.foto || null) : undefined

  const updateData: Record<string, unknown> = {}
  if (body.nama_kegiatan !== undefined) updateData.nama_kegiatan = body.nama_kegiatan
  if (body.jenis_kegiatan !== undefined) updateData.jenis_kegiatan = body.jenis_kegiatan
  if (body.lokasi !== undefined) updateData.tempat = body.lokasi
  if (body.catatan !== undefined) updateData.catatan = body.catatan
  if (body.rt !== undefined) updateData.rt = body.rt
  if (body.rw !== undefined) updateData.rw = body.rw
  if (body.jumlah_peserta !== undefined) updateData.jumlah_peserta = body.jumlah_peserta ? Number(body.jumlah_peserta) : undefined
  if (body.link_gmaps !== undefined) updateData.link_gmaps = body.link_gmaps
  if (body.tanggal !== undefined) updateData.tanggal = body.tanggal ? new Date(body.tanggal) : undefined
  if (body.foto !== undefined) updateData.foto = fotoVal

  if (body.team_id !== undefined && scope.isGlobal) {
    updateData.team_id = body.team_id || null
  }

  const updated = await prisma.kegiatan.update({
    where: { id },
    data: {
      ...updateData,
      kunjungan: body.jam
        ? {
            update: {
              jam: body.jam,
            },
          }
        : undefined,
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
    tempat: updated.tempat ?? '',
    catatan: updated.catatan ?? '',
  })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const scope = await getDataScope()
  const kegiatan = await prisma.kegiatan.findFirst({
    where: { id, ...teamFilter(scope) },
    select: { kunjungan_id: true },
  })
  if (!kegiatan) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.$transaction([
    prisma.kegiatan.delete({ where: { id } }),
    prisma.kunjungan.delete({ where: { id: kegiatan.kunjungan_id } }),
  ])
  return NextResponse.json({ success: true })
}
