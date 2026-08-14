import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const a = await prisma.aspirasis.findUnique({
    where: { id },
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
      trackings: {
        orderBy: { created_at: 'asc' },
        include: {
          diverifikasiOleh: true,
        },
      },
    },
  })

  if (!a) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: a.id,
    id_laporan: a.id_laporan,
    nik: a.nik ?? '',
    sumber: a.sumber,
    deskripsi: a.deskripsi,
    status: a.status,
    pelapor_nama: a.pelapor_nama,
    pelapor_email: a.pelapor_email ?? '',
    pelapor_telepon: a.pelapor_telepon,
    lampiran: a.lampiran,
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
    rt: a.rt ?? '',
    rw: a.rw ?? '',
    trackings: a.trackings.map((t) => ({
      id: t.id,
      aspirasi_id: t.aspirasi_id,
      diverifikasi_oleh_id: t.diverifikasiOleh?.id ?? '',
      diverifikasi_oleh_nama: t.diverifikasiOleh?.name ?? '',
      status: t.status,
      catatan: t.catatan ?? '',
      lampiran: t.lampiran,
      created_at: t.created_at.toISOString(),
    })),
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  if (body.status) {
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
        diverifikasi_oleh_id: body.diverifikasi_oleh_id,
      },
    })
  } else {
    await prisma.aspirasis.update({
      where: { id },
      data: {
        nik: body.nik ?? undefined,
        sumber: body.sumber ?? undefined,
        deskripsi: body.deskripsi ?? undefined,
        pelapor_nama: body.pelapor_nama ?? undefined,
        pelapor_email: body.pelapor_email ?? undefined,
        pelapor_telepon: body.pelapor_telepon ?? undefined,
        lampiran: Array.isArray(body.lampiran) ? body.lampiran : undefined,
        kategori_usulan: body.kategori_usulan ?? undefined,
        jenis_usulan: body.jenis_usulan ?? undefined,
        jenis_reses: body.jenis_reses ?? undefined,
        tindak_lanjut: body.tindak_lanjut ?? undefined,
        tanggal_dibuat: body.tanggal_dibuat ? new Date(body.tanggal_dibuat) : undefined,
        alamat: body.alamat ?? undefined,
        kota_id: body.kota_id ?? null,
        kecamatan_id: body.kecamatan_id ?? null,
        kelurahan_id: body.kelurahan_id ?? null,
      },
    })
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
    lampiran: updated.lampiran,
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
    rt: updated.rt,
    rw: updated.rw,
    lokasi: updated.alamat ?? '',
  })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.trackingAspirasi.deleteMany({ where: { aspirasi_id: id } })
  await prisma.aspirasis.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
