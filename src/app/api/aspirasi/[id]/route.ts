import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const a = await prisma.aspirasi.findUnique({
    where: { id },
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
    },
  })

  if (!a) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: a.id,
    nik: a.nik ?? '',
    sumber: a.sumber,
    deskripsi: a.deskripsi,
    status: a.status,
    pelapor_nama: a.pelapor_nama,
    pelapor_email: a.pelapor_email ?? '',
    pelapor_telepon: a.pelapor_telepon,
    lampiran: a.lampiran as string[] ?? [],
    bukti_tindak_lanjut: a.bukti_tindak_lanjut as string[] ?? [],
    catatan_tindak_lanjut: a.catatan_tindak_lanjut ?? '',
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
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}
  if (body.status) updateData.status = body.status
  if (body.catatan_tindak_lanjut !== undefined)
    updateData.catatan_tindak_lanjut = body.catatan_tindak_lanjut
  if (body.bukti_tindak_lanjut !== undefined)
    updateData.bukti_tindak_lanjut = body.bukti_tindak_lanjut

  const updated = await prisma.aspirasi.update({
    where: { id },
    data: updateData,
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
    },
  })

  return NextResponse.json({
    id: updated.id,
    nik: updated.nik ?? '',
    sumber: updated.sumber,
    deskripsi: updated.deskripsi,
    status: updated.status,
    pelapor_nama: updated.pelapor_nama,
    pelapor_email: updated.pelapor_email ?? '',
    pelapor_telepon: updated.pelapor_telepon,
    lampiran: updated.lampiran as string[] ?? [],
    bukti_tindak_lanjut: updated.bukti_tindak_lanjut as string[] ?? [],
    catatan_tindak_lanjut: updated.catatan_tindak_lanjut ?? '',
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
