import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 })
    }

    // 1. Ambil bytes & buat buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 2. Buat nama file unik
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const filePath = path.join(process.cwd(), 'public/uploads', uniqueFilename)

    // 3. Simpan file fisik ke folder /public/uploads/
    await writeFile(filePath, buffer)

    // 4. Return URL Relatif yang nantinya disimpan ke Database
    const fileUrl = `/uploads/${uniqueFilename}`

    return NextResponse.json({ success: true, url: fileUrl })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal mengunggah file' }, { status: 500 })
  }
}
