import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const a = await prisma.aspirasis.findUnique({
    where: { id },
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
      trackings: { orderBy: { created_at: 'asc' } },
    },
  })

  if (!a) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const statusPriority = [
    'SUDAH_DITINDAKLANJUTI',
    'SEDANG_DITINDAKLANJUTI',
    'BELUM_DITINDAKLANJUTI',
    'TIDAK_BISA_DITINDAKLANJUTI',
  ]

  const trackings = a.trackings.slice().sort((left, right) => {
    const leftOrder = statusPriority.indexOf(left.status)
    const rightOrder = statusPriority.indexOf(right.status)
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }
    return left.created_at.getTime() - right.created_at.getTime()
  })

  return NextResponse.json({
    id: a.id,
    id_laporan: a.id_laporan ?? '',
    nik: a.nik ?? '',
    sumber: a.sumber,
    deskripsi: a.deskripsi,
    status: a.status,
    pelapor_nama: a.pelapor_nama,
    pelapor_email: a.pelapor_email ?? '',
    pelapor_telepon: a.pelapor_telepon,
    lampiran: (Array.isArray(a.lampiran) ? a.lampiran.map((f: unknown) => typeof f === 'string' ? f : (f as Record<string, unknown>).base64 ?? '') : []) as string[],
    kategori_usulan: a.kategori_usulan,
    jenis_usulan: a.jenis_usulan,
    jenis_reses: a.jenis_reses,
    tindak_lanjut: a.tindak_lanjut,
    tanggal_dibuat: a.tanggal_dibuat.toISOString(),
    created_at: a.created_at.toISOString(),
    updated_at: a.updated_at.toISOString(),
    kota: a.kota?.nama ?? '',
    kecamatan: a.kecamatan?.nama ?? '',
    kelurahan: a.kelurahan?.nama ?? '',
    lokasi: a.alamat ?? '',
    trackings: trackings.map((t) => ({
      id: t.id,
      aspirasi_id: t.aspirasi_id,
      status: t.status,
      catatan: t.catatan ?? '',
      lampiran: (Array.isArray(t.lampiran) ? t.lampiran.map((f: unknown) => typeof f === 'string' ? f : (f as Record<string, unknown>).base64 ?? '') : []) as string[],
      created_at: t.created_at.toISOString(),
    })),
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  if (body.status) {
    // Update status + create tracking record
    await prisma.aspirasis.update({
      where: { id },
      data: { status: body.status },
    })

    await prisma.trackingAspirasi.create({
      data: {
        aspirasi_id: id,
        status: body.status,
        catatan: body.catatan ?? '',
        lampiran: body.lampiran ?? [],
      },
    })
  } else {
    // Edit data fields
    const updateData: Record<string, unknown> = {}
    if (body.pelapor_nama !== undefined) updateData.pelapor_nama = body.pelapor_nama
    if (body.pelapor_telepon !== undefined) updateData.pelapor_telepon = body.pelapor_telepon
    if (body.pelapor_email !== undefined) updateData.pelapor_email = body.pelapor_email
    if (body.deskripsi !== undefined) updateData.deskripsi = body.deskripsi
    if (body.kategori_usulan !== undefined) updateData.kategori_usulan = body.kategori_usulan
    if (body.jenis_usulan !== undefined) updateData.jenis_usulan = body.jenis_usulan
    if (body.jenis_reses !== undefined) updateData.jenis_reses = body.jenis_reses
    if (body.tindak_lanjut !== undefined) updateData.tindak_lanjut = body.tindak_lanjut
    if (body.sumber !== undefined) updateData.sumber = body.sumber
    if (body.alamat !== undefined) updateData.alamat = body.alamat

    if (Object.keys(updateData).length > 0) {
      await prisma.aspirasis.update({
        where: { id },
        data: updateData,
      })
    }
  }

  const updated = await prisma.aspirasis.findUnique({
    where: { id },
    include: { kota: true, kecamatan: true, kelurahan: true },
  })

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: updated.id,
    nik: updated.nik ?? '',
    sumber: updated.sumber,
    deskripsi: updated.deskripsi,
    status: updated.status,
    pelapor_nama: updated.pelapor_nama,
    pelapor_email: updated.pelapor_email ?? '',
    pelapor_telepon: updated.pelapor_telepon,
    lampiran: (Array.isArray(updated.lampiran) ? updated.lampiran.map((f: unknown) => typeof f === 'string' ? f : (f as Record<string, unknown>).base64 ?? '') : []) as string[],
    kategori_usulan: updated.kategori_usulan,
    jenis_usulan: updated.jenis_usulan,
    jenis_reses: updated.jenis_reses,
    tindak_lanjut: updated.tindak_lanjut,
    tanggal_dibuat: updated.tanggal_dibuat.toISOString(),
    created_at: updated.created_at.toISOString(),
    updated_at: updated.updated_at.toISOString(),
    kota: updated.kota?.nama ?? '',
    kecamatan: updated.kecamatan?.nama ?? '',
    kelurahan: updated.kelurahan?.nama ?? '',
    lokasi: updated.alamat ?? '',
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.trackingAspirasi.deleteMany({ where: { aspirasi_id: id } })
  await prisma.aspirasis.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
