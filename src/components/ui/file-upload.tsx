'use client'

import React, { useState, type ChangeEvent } from 'react'
import { MdUploadFile, MdDelete, MdInsertDriveFile, MdClose } from 'react-icons/md'
import { cn } from '@/utils/cn'
import { Button } from './button'

interface FileUploadProps {
  label: string
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string
  value?: any // Dibuat any agar fleksibel menerima string / array / null dari DB
  onChange: (files: string[]) => void
  className?: string
  multiple?: boolean
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp']

// HELPER: Paksa ubah ke Array String yang aman
const ensureArray = (val: any): string[] => {
  if (!val) return []

  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (typeof item === 'string') return item
        if (typeof item === 'object' && item?.base64) return item.base64
        return null
      })
      .filter((item): item is string => Boolean(item))
  }

  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      // bukan JSON array
    }
    return [val]
  }

  return []
}

export const FileUpload = ({
  label,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedTypes,
  value,
  onChange,
  className,
  multiple = true,
}: FileUploadProps): React.ReactNode => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileList = ensureArray(value)

  const getFileName = (fileString: string, index: number): string => {
    if (!fileString) return `File ${index + 1}`
    if (fileString.startsWith('data:')) return `File_Base64_${index + 1}`

    const cleanUrl = fileString.split('?')[0].split('#')[0]
    const fileName = cleanUrl.split('/').pop()
    return fileName ? decodeURIComponent(fileName) : `File ${index + 1}`
  }

  const handleViewFile = (fileString: string) => {
    if (!fileString) return
    window.open(fileString, '_blank')
  }

  // 1. TAHAP PEMILIHAN FILE (Hanya simpan di state lokal)
  const handleSelectFiles = (inputFiles: FileList) => {
    const incomingFiles = Array.from(inputFiles)
    if (incomingFiles.length === 0) return

    // Validasi kuota file (file terunggah + file di antrean + file baru)
    const currentTotal = multiple ? fileList.length + selectedFiles.length : 0
    if (currentTotal + incomingFiles.length > maxFiles) {
      alert(`Maksimal hanya dapat memilih ${maxFiles} file.`)
      return
    }

    // Validasi ukuran tiap file
    const validFiles: File[] = []
    for (const file of incomingFiles) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File "${file.name}" melebihi batas ukuran ${maxSizeMB}MB.`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setSelectedFiles((prev) => (multiple ? [...prev, ...validFiles] : [validFiles[0]]))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleSelectFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 2. TAHAP EKSEKUSI UPLOAD (Dipicu oleh tombol "Unggah")
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    const newUploadedUrls: string[] = []

    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (data.success && data.url) {
          newUploadedUrls.push(data.url)
        } else {
          alert(`Gagal mengunggah ${file.name}\n\nAlasan: ${data.message || 'Unknown error'}`)
        }
      }

      if (newUploadedUrls.length > 0) {
        onChange(multiple ? [...fileList, ...newUploadedUrls] : [newUploadedUrls[0]])
        setSelectedFiles([]) // Kosongkan antrean setelah selesai
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengunggah file.')
    } finally {
      setUploading(false)
    }
  }

  const removeUploadedFile = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    const updatedFiles = fileList.filter((_, i) => i !== index)
    onChange(updatedFiles)
  }

  const inputId = `file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className={cn('flex flex-col h-full w-full gap-2', className)}>
      <label className="block text-sm font-medium text-[var(--color-text)] shrink-0">{label}</label>

      {/* DROPZONE / AREA PILIH FILE */}
      <div
        className={cn(
          'flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center transition-colors min-h-[160px]',
          isDragging
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-bg)]',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files) handleSelectFiles(e.dataTransfer.files)
        }}
      >
        <MdUploadFile size={36} className="mx-auto mb-2 text-[var(--color-text-secondary)]" />
        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
          Drag & drop file atau klik tombol di bawah untuk memilih
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          PDF, Word, Excel, PPT, JPEG, JPG, PNG (Maks {maxSizeMB}MB per file, maks {maxFiles} file)
        </p>

        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes || ALLOWED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
          id={inputId}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="cursor-pointer"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          Pilih Berkas
        </Button>
      </div>

      {/* ANTREAN FILE YANG DIPILIH (BELUM DIUNGGAH) */}
      {selectedFiles.length > 0 && (
        <div className="p-3 border border-amber-200 bg-amber-50/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">File siap diunggah ({selectedFiles.length})</span>
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={handleUpload}
              className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              {uploading ? 'Mengunggah...' : 'Unggah Sekarang'}
            </Button>
          </div>

          <div className="space-y-1">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs bg-white p-2 rounded border border-amber-100"
              >
                <span className="truncate max-w-[80%] font-medium">{file.name}</span>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => removeSelectedFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <MdClose size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAFTAR FILE YANG SUDAH BERHASIL TER-UPLOAD */}
      {fileList.length > 0 && (
        <div className="space-y-2 mt-1 shrink-0 overflow-y-auto">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">File Terunggah:</p>
          {fileList.map((fileItem, index) => (
            <div
              key={index}
              className="flex items-center p-3 justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <MdInsertDriveFile className="text-blue-500 shrink-0" size={20} />
                <div className="truncate">
                  <p className="text-xs font-medium truncate">{getFileName(fileItem, index)}</p>
                </div>
              </div>

              {/* ACTION BUTTONS (LIHAT & HAPUS) */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  title="Lihat Berkas"
                  className="h-7 px-3 text-xs font-medium border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100 rounded-md transition-all"
                  onClick={() => handleViewFile(fileItem)}
                >
                  Lihat
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Hapus Berkas"
                  className="cursor-pointer h-7 w-7 p-0"
                  onClick={(e) => removeUploadedFile(e, index)}
                >
                  <MdDelete size={16} className="text-red-500 hover:text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
