import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { dummyAspirasi } from '@/data/dummy'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data, error } = await supabaseAdmin
      .from('aspirasi')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json(data)
  } catch {
    const dummy = dummyAspirasi.find((a) => a.id === id)
    return NextResponse.json(dummy ?? dummyAspirasi[0])
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.status) updateData.status = body.status
    if (body.catatan_tindak_lanjut !== undefined)
      updateData.catatan_tindak_lanjut = body.catatan_tindak_lanjut
    if (body.bukti_tindak_lanjut !== undefined)
      updateData.bukti_tindak_lanjut = body.bukti_tindak_lanjut

    const { data, error } = await supabaseAdmin
      .from('aspirasi')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { message: 'Supabase not configured. Status update simulated.' },
      { status: 200 }
    )
  }
}
