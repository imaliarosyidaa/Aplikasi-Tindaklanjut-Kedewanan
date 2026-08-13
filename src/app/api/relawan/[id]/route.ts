import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDataScope, teamFilter } from '@/lib/scoping'

async function findRelawanOrScoped(id: string) {
  const scope = await getDataScope()
  const where: Record<string, unknown> = { id, ...teamFilter(scope) }
  const r = await prisma.relawan.findFirst({
    where,
    include: { kota: true, kecamatan: true, kelurahan: true },
  })
  return { scope, relawan: r }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { relawan: r } = await findRelawanOrScoped(id)
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    id: r.id,
    nik: r.nik ?? '',
    nama: r.nama,
    no_telepon: r.no_telepon ?? '',
    jenis_kelamin: r.jenis_kelamin,
    alamat: r.alamat,
    domisili_sekarang: r.domisili_sekarang ?? '',
    posisi: r.posisi,
    foto: r.foto ?? '',
    kota_kabupaten: r.kota.nama,
    kecamatan: r.kecamatan.nama,
    kelurahan: r.kelurahan.nama,
    team_id: r.team_id ?? '',
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { scope, relawan: existing } = await findRelawanOrScoped(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  const updateData: Record<string, unknown> = {}
  if (body.nama !== undefined) updateData.nama = body.nama
  if (body.nik !== undefined) updateData.nik = body.nik
  if (body.no_telepon !== undefined) updateData.no_telepon = body.no_telepon
  if (body.jenis_kelamin !== undefined) updateData.jenis_kelamin = body.jenis_kelamin
  if (body.posisi !== undefined) updateData.posisi = body.posisi
  if (body.alamat !== undefined) updateData.alamat = body.alamat
  if (body.domisili_sekarang !== undefined) updateData.domisili_sekarang = body.domisili_sekarang
  if (body.foto !== undefined) updateData.foto = body.foto || null

  if (body.team_id !== undefined && scope.isGlobal) {
    updateData.team_id = body.team_id || null
  }

  if (body.kota_kabupaten || body.kecamatan || body.kelurahan) {
    if (body.kota_kabupaten) {
      const kota = await prisma.kota.findFirstOrThrow({ where: { nama: body.kota_kabupaten } })
      updateData.kota_id = kota.id
    }
    if (body.kecamatan) {
      const kecamatan = await prisma.kecamatan.findFirstOrThrow({ where: { nama: body.kecamatan } })
      updateData.kecamatan_id = kecamatan.id
    }
    if (body.kelurahan) {
      const kelurahan = await prisma.kelurahan.findFirstOrThrow({ where: { nama: body.kelurahan } })
      updateData.kelurahan_id = kelurahan.id
    }
  }

  const updated = await prisma.relawan.update({
    where: { id },
    data: updateData,
    include: { kota: true, kecamatan: true, kelurahan: true },
  })

  return NextResponse.json({
    id: updated.id,
    nama: updated.nama,
    nik: updated.nik ?? '',
    team_id: updated.team_id ?? '',
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { relawan: existing } = await findRelawanOrScoped(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.relawan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
