import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { dummyKunjungan } from '@/data/dummy'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('kunjungan')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json(dummyKunjungan)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('kunjungan')
      .insert({
        jenis_kegiatan: body.jenis_kegiatan ?? '',
        tanggal: body.tanggal,
        jam: body.jam,
        jalan: body.jalan,
        kelurahan: body.kelurahan,
        kecamatan: body.kecamatan,
        kota: body.kota ?? 'Jakarta Selatan',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Supabase not configured. Data would be saved when connected.' },
      { status: 200 }
    )
  }
}
