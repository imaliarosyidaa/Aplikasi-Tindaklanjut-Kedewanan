'use client'

import React, { useState, useId, type ChangeEvent } from 'react'
import { MdUploadFile, MdDelete, MdInsertDriveFile, MdClose, MdCloudUpload } from 'react-icons/md'
import { cn } from '@/utils/cn'
import { Button } from './button'

interface FileUploadProps {
  label: string
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string
  value?: any
  onChange: (files: string[]) => void
  className?: string
  multiple?: boolean
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp']

// HELPER: Standarisasi Array String URL
const ensureArray = (val: any): string[] => {
  if (!val) return []

  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (typeof item === 'string') return item
        if (typeof item === 'object' && item?.url) return item.url
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
      // String biasa
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
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFileName, setUploadingFileName] = useState('')

  const fileList = ensureArray(value)

  const getFileName = (fileString: string, index: number): string => {
    if (!fileString) return `Berkas ${index + 1}`
    if (fileString.startsWith('data:')) return `Berkas_${index + 1}`

    const cleanUrl = fileString.split('?')[0].split('#')[0]
    const fileName = cleanUrl.split('/').pop()
    return fileName ? decodeURIComponent(fileName) : `Berkas ${index + 1}`
  }

  const uploadToSignedUrlWithProgress = async (
    signedUrl: string,
    file: File,
    onProgress: (progress: number) => void,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('PUT', signedUrl)
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100)
          resolve()
        } else {
          reject(new Error(`Upload gagal (${xhr.status}): ${xhr.responseText}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error saat upload ke storage'))
      xhr.onabort = () => reject(new Error('Upload dibatalkan'))

      xhr.send(file)
    })
  }

  const handleSelectFiles = (inputFiles: FileList | File[]) => {
    const incomingFiles = Array.from(inputFiles)
    if (incomingFiles.length === 0) return

    const currentTotal = multiple ? fileList.length + selectedFiles.length : 0
    if (currentTotal + incomingFiles.length > maxFiles) {
      alert(`Maksimal hanya dapat memilih total ${maxFiles} file.`)
      return
    }

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
    if (e.target.files && e.target.files.length > 0) {
      handleSelectFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const newUploadedUrls: string[] = []

    try {
      for (const file of selectedFiles) {
        setUploadingFileName(file.name)
        setUploadProgress(0)

        // 1. Minta Signed URL dari Backend
        const signResponse = await fetch('/api/upload/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        })

        const signData = await signResponse.json()

        if (!signResponse.ok || !signData.success) {
          alert(`Gagal mempersiapkan upload ${file.name}: ${signData.message || 'Error server'}`)
          continue
        }

        // 2. Upload langsung dengan progress bar
        await uploadToSignedUrlWithProgress(signData.signedUrl || signData.url, file, (progress) => {
          setUploadProgress(progress)
        })

        // 3. Ambil URL Publik (dikembalikan oleh api/upload/sign)
        const publicUrl = signData.publicUrl || signData.url || null

        if (publicUrl) {
          newUploadedUrls.push(publicUrl)
        }
      }

      if (newUploadedUrls.length > 0) {
        onChange(multiple ? [...fileList, ...newUploadedUrls] : [newUploadedUrls[0]])
        setSelectedFiles([])
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Terjadi kesalahan saat mengunggah: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadingFileName('')
    }
  }

  const removeUploadedFile = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    const updatedFiles = fileList.filter((_, i) => i !== index)
    onChange(updatedFiles)
  }

  return (
    <div className={cn('flex flex-col h-full w-full gap-2', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text)] shrink-0">
        {label}
      </label>

      {/* DROPZONE AREA */}
      <div
        className={cn(
          'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center transition-colors min-h-[150px] cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
            : 'border-[var(--color-border)] hover:border-blue-400 bg-[var(--color-bg)]',
          uploading && 'opacity-60 pointer-events-none',
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
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <MdUploadFile size={36} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
          Tarik & letakkan berkas di sini, atau <span className="text-blue-600 underline">pilih dari perangkat</span>
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          PDF, Word, Excel, PPT, Gambar (Maks {maxSizeMB}MB/file, maks {maxFiles} berkas)
        </p>

        <input
          id={inputId}
          type="file"
          multiple={multiple}
          accept={acceptedTypes || ALLOWED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* PROGRESS BAR SAAT UPLOAD BERJALAN */}
      {uploading && (
        <div className="space-y-1.5 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-amber-800 dark:text-amber-200 truncate max-w-[80%]">
              Mengunggah: {uploadingFileName}
            </span>
            <span className="text-amber-700 dark:text-amber-300 font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
            <div
              className="h-full rounded-full bg-amber-600 transition-all duration-200 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ANTREAN FILE TERPILIH (BELUM DIUNGGAH) */}
      {selectedFiles.length > 0 && !uploading && (
        <div className="space-y-2 p-3 rounded-lg border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              Berkas Siap Diunggah ({selectedFiles.length})
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleUpload}
              className="flex items-center gap-1.5 h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MdCloudUpload size={16} />
              Mulai Unggah
            </Button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <MdInsertDriveFile className="text-blue-500 shrink-0" size={16} />
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-400 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSelectedFile(idx)
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <MdClose size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAFTAR FILE YANG SUDAH TERUNGGAH */}
      {fileList.length > 0 && (
        <div className="space-y-2 mt-1 shrink-0">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Berkas Terunggah ({fileList.length}):
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {fileList.map((fileItem, index) => (
              <div
                key={index}
                className="flex items-center p-2.5 justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MdInsertDriveFile className="text-emerald-500 shrink-0" size={20} />
                  <p className="text-xs font-medium truncate">{getFileName(fileItem, index)}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs font-medium border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded"
                    onClick={() => window.open(fileItem, '_blank')}
                  >
                    Lihat
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => removeUploadedFile(e, index)}
                  >
                    <MdDelete size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
