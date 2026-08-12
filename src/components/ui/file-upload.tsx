'use client'

import React, { useState, type ChangeEvent } from 'react'
import { MdUploadFile, MdDelete, MdInsertDriveFile } from 'react-icons/md'
import { cn } from '@/utils/cn'
import { Button } from './button'

interface FileUploadItem {
  name?: string
  size?: number
  type?: string
  base64?: string
}

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

// HELPER: Apapun tipe data inputnya (string / JSON string / array), paksa ubah jadi Array String yang aman
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

  // Pastikan value selalu dibaca sebagai Array
  const fileList = ensureArray(value)

  console.log('FileUpload value:', value)
  console.log('FileUpload fileList:', fileList)
  // Ambil nama file dari URL path
  const getFileName = (fileString: string, index: number): string => {
    if (!fileString) return `File ${index + 1}`
    if (fileString.startsWith('data:')) return `File_Base64_${index + 1}`

    const cleanUrl = fileString.split('?')[0].split('#')[0]
    const fileName = cleanUrl.split('/').pop()
    return fileName ? decodeURIComponent(fileName) : `File ${index + 1}`
  }

  // Buka file di tab baru saat tombol "Lihat" diklik
  const handleViewFile = (fileString: string) => {
    if (!fileString) return
    window.open(fileString, '_blank')
  }

  // Upload file fisik ke API /api/upload
  const handleFiles = async (inputFiles: FileList) => {
    const filesToUpload = Array.from(inputFiles)
    if (filesToUpload.length === 0) return

    if (fileList.length + filesToUpload.length > maxFiles) {
      alert(`Maksimal hanya dapat mengunggah ${maxFiles} file.`)
      return
    }

    setUploading(true)
    const newUploadedUrls: string[] = []

    try {
      for (const selectedFile of filesToUpload) {
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
          alert(`File ${selectedFile.name} melebihi batas ukuran ${maxSizeMB}MB.`)
          continue
        }

        const formData = new FormData()
        formData.append('file', selectedFile)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (data.success && data.url) {
          newUploadedUrls.push(data.url)
        } else {
          alert(`Gagal mengunggah file ${selectedFile.name}`)
        }
      }

      if (newUploadedUrls.length > 0) {
        onChange([...fileList, ...newUploadedUrls])
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengunggah file.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeFile = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    const updatedFiles = fileList.filter((_, i) => i !== index)
    onChange(updatedFiles)
  }

  return (
    <div className={cn('flex flex-col h-full w-full gap-2', className)}>
      <label className="block text-sm font-medium text-[var(--color-text)] shrink-0">{label}</label>

      {/* DROPZONE */}
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
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
        }}
      >
        <MdUploadFile size={36} className="mx-auto mb-2 text-[var(--color-text-secondary)]" />
        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
          {uploading ? 'Mengunggah file...' : 'Drag & drop file atau klik untuk pilih'}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          PDF, Word, Excel, PPT, JPEG, PNG (Maks {maxSizeMB}MB per file, maks {maxFiles} file)
        </p>

        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes || ALLOWED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
          id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="cursor-pointer"
          onClick={() => document.getElementById(`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
        >
          {uploading ? 'Proses Upload...' : 'Pilih File'}
        </Button>
      </div>

      {/* DAFTAR FILE TER-UPLOAD */}
      {fileList.length > 0 && (
        <div className="space-y-2 mt-1 shrink-0 overflow-y-auto">
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
                  onClick={(e) => removeFile(e, index)}
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
