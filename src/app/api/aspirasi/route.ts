import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { dummyAspirasi } from '@/data/dummy'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('aspirasi')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json(dummyAspirasi)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('aspirasi')
      .insert({
        sumber: body.sumber,
        deskripsi: body.deskripsi,
        pelapor_nama: body.pelapor_nama,
        pelapor_email: body.pelapor_email ?? '',
        pelapor_telepon: body.pelapor_telepon ?? '',
        status: 'BELUM_DITINDAKLANJUTI',
        lampiran: body.lampiran ?? [],
        bukti_tindak_lanjut: [],
        catatan_tindak_lanjut: '',
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
