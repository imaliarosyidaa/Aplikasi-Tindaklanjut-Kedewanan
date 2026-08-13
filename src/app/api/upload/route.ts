import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'File tidak ditemukan',
        },
        { status: 400 },
      )
    }

    // Buat nama file yang aman dan unik
    const originalName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')

    const uniqueFilename = `${Date.now()}-${crypto.randomUUID()}-${originalName}`

    // Path di dalam bucket Supabase
    const filePath = `uploads/${uniqueFilename}`

    // Ambil file sebagai ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('aplikasi-tindaklanjut')
      .upload(filePath, arrayBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)

      return NextResponse.json(
        {
          success: false,
          message: uploadError.message,
        },
        { status: 500 },
      )
    }

    // Ambil URL public
    const { data: publicUrlData } = supabaseAdmin.storage.from('aplikasi-tindaklanjut').getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      pathname: filePath,
      filename: file.name,
    })
  } catch (error) {
    console.error('UPLOAD ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Gagal mengunggah file',
      },
      { status: 500 },
    )
  }
}
