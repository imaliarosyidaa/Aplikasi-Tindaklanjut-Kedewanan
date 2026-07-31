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
  value?: (string | FileUploadItem)[]
  onChange: (files: string[]) => void
  className?: string
  multiple?: boolean
}

const toBase64String = (item: string | FileUploadItem | undefined): string => {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object' && typeof item.base64 === 'string')
    return item.base64
  return ''
}

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
]

export const FileUpload = ({
  label,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedTypes,
  value = [],
  onChange,
  className,
  multiple = true,
}: FileUploadProps): React.ReactNode => {
  const [isDragging, setIsDragging] = useState(false)
  const maxSize = maxSizeMB * 1024 * 1024

  // Helper konversi file ke Base64 (string)
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Helper untuk mendapatkan nama file dari Base64 atau URL
  const getFileName = (
    item: string | FileUploadItem,
    index: number
  ): string => {
    const fileString = toBase64String(item)
    if (!fileString) return `File ${index + 1}`

    // Jika Base64
    if (fileString.startsWith('data:')) {
      const mime = fileString.split(';')[0].split(':')[1] || ''
      const ext = mime.split('/')[1] || 'file'
      return `Berkas_${index + 1}.${ext}`
    }

    // Jika URL biasa
    try {
      const url = new URL(fileString)
      const fileName = url.pathname.split('/').pop()
      return fileName ? decodeURIComponent(fileName) : `File ${index + 1}`
    } catch {
      const cleanUrl = fileString.split('?')[0].split('#')[0]
      const fileName = cleanUrl.split('/').pop()
      return fileName ? decodeURIComponent(fileName) : `File ${index + 1}`
    }
  }

  const handleFiles = async (files: FileList) => {
    const newFileStrings: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()

      if (
        acceptedTypes
          ? file.type.startsWith(acceptedTypes.split(',')[0])
          : !ALLOWED_EXTENSIONS.includes(ext ?? '')
      ) {
        if (!ALLOWED_EXTENSIONS.includes(ext ?? '')) {
          continue
        }
      }

      if (file.size > maxSize) continue
      if (value.length + newFileStrings.length >= maxFiles) continue

      const base64String = await convertToBase64(file)
      newFileStrings.push(base64String)
    }

    if (multiple) {
      onChange([
        ...value.map(toBase64String).filter(Boolean),
        ...newFileStrings,
      ])
    } else {
      onChange(newFileStrings.slice(0, 1))
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    onChange(
      value
        .map(toBase64String)
        .filter((s) => s !== '')
        .filter((_, i) => i !== index)
    )
  }

  return (
    <div className={cn('flex flex-col h-full w-full gap-2', className)}>
      <label className="block text-sm font-medium text-[var(--color-text)] shrink-0">
        {label}
      </label>

      {/* DROPZONE: Mengisi sisa ruang kosong (flex-1) & center alignment */}
      <div
        className={cn(
          'flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center transition-colors min-h-[160px]',
          isDragging
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-bg)]'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <MdUploadFile
          size={36}
          className="mx-auto mb-2 text-[var(--color-text-secondary)]"
        />
        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
          Drag & drop file atau klik untuk pilih
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          PDF, Word, Excel, PPT, JPEG, PNG (Maks {maxSizeMB}MB per file, maks{' '}
          {maxFiles} file)
        </p>

        <input
          type="file"
          multiple={multiple}
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() =>
            document
              .getElementById(
                `file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`
              )
              ?.click()
          }
        >
          Pilih File
        </Button>
      </div>

      {/* DAFTAR FILE TER-UPLOAD */}
      {value.length > 0 && (
        <div className="space-y-2 mt-1 shrink-0 max-h-[140px] overflow-y-auto">
          {value.map((fileString, index) => (
            <div
              key={index}
              className="flex items-center p-3 justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <MdInsertDriveFile
                  className="text-blue-500 shrink-0"
                  size={20}
                />
                <div className="truncate">
                  <p className="text-xs font-medium truncate">
                    {getFileName(fileString, index)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer h-7 w-7 p-0"
                onClick={() => removeFile(index)}
              >
                <MdDelete size={16} className="text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}