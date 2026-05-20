'use client'

import React, { useState, type ChangeEvent } from 'react'
import { MdUploadFile, MdDelete, MdInsertDriveFile } from 'react-icons/md'
import { cn } from '@/utils/cn'
import { Button } from './button'

interface UploadedFile {
  name: string
  size: number
  type: string
  base64: string
}

interface FileUploadProps {
  label: string
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string
  value: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  className?: string
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
]

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp']

export const FileUpload = ({
  label,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedTypes,
  value = [],
  onChange,
  className,
}: FileUploadProps): React.ReactNode => {
  const [isDragging, setIsDragging] = useState(false)

  const maxSize = maxSizeMB * 1024 * 1024

  const convertToBase64 = (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          base64: reader.result as string,
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = async (files: FileList) => {
    const newFiles: UploadedFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (acceptedTypes ? file.type.startsWith(acceptedTypes.split(',')[0]) : !ALLOWED_EXTENSIONS.includes(ext ?? '')) {
        if (!ALLOWED_EXTENSIONS.includes(ext ?? '')) {
          continue
        }
      }

      if (file.size > maxSize) continue
      if (value.length + newFiles.length >= maxFiles) continue

      const uploadedFile = await convertToBase64(file)
      newFiles.push(uploadedFile)
    }

    onChange([...value, ...newFiles])
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
    onChange(value.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string): React.ReactNode => {
    if (type.startsWith('image/')) return <MdInsertDriveFile />
    return <MdInsertDriveFile />
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <MdUploadFile size={32} className="mx-auto mb-2 text-[var(--color-text-secondary)]" />
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          Drag & drop file atau klik untuk pilih
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          PDF, Word, Excel, PPT, JPEG, PNG (Maks {maxSizeMB}MB per file, maks {maxFiles} file)
        </p>
        <input
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          id={`file-upload-${label}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
        >
          Pilih File
        </Button>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 bg-[var(--color-bg-secondary)]"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(file.type)}
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <MdDelete size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
