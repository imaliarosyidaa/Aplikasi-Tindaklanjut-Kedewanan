import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET = 'aplikasi-tindaklanjut'

const ALLOWED_MIME_TYPES = [
  'application/pdf',

  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
]

const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { fileName, fileType, fileSize } = body

    console.log('🔐 SIGN REQUEST:', {
      fileName,
      fileType,
      fileSize,
      fileSizeMB: typeof fileSize === 'number' ? (fileSize / 1024 / 1024).toFixed(2) : null,
    })

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama file tidak valid',
        },
        { status: 400 },
      )
    }

    if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType)) {
      console.error('❌ MIME TYPE DITOLAK:', {
        fileName,
        fileType,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Tipe file tidak diizinkan: ${fileType}`,
        },
        { status: 400 },
      )
    }

    if (typeof fileSize !== 'number' || fileSize <= 0 || fileSize > MAX_SIZE_BYTES) {
      console.error('❌ UKURAN FILE DITOLAK:', {
        fileName,
        fileSize,
        fileSizeMB: typeof fileSize === 'number' ? (fileSize / 1024 / 1024).toFixed(2) : null,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ukuran file maksimal ${MAX_SIZE_MB} MB`,
        },
        { status: 400 },
      )
    }

    // Nama file dibuat aman
    const originalName = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')

    const uniqueFilename = `${Date.now()}-${crypto.randomUUID()}-${originalName}`

    const filePath = `uploads/${uniqueFilename}`

    console.log('🔑 MEMBUAT SIGNED UPLOAD URL:', {
      filePath,
      fileType,
      fileSizeMB: (fileSize / 1024 / 1024).toFixed(2),
    })

    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(filePath, {
      upsert: false,
    })

    if (error) {
      console.error('❌ GAGAL MEMBUAT SIGNED URL:', {
        message: error.message,
        name: error.name,
      })

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 },
      )
    }

    console.log('✅ SIGNED URL BERHASIL DIBUAT:', {
      filePath,
    })

    // api/upload/sign/route.ts
    const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl

    return NextResponse.json({
      success: true,
      token: data.token,
      path: data.path,
      bucket: BUCKET,
      publicUrl,
      signedUrl: data.signedUrl,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    })
  } catch (error) {
    console.error('❌ SIGN API ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Gagal membuat signed upload URL',
      },
      { status: 500 },
    )
  }
}
