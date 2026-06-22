'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { useUpdateStatus } from '@/hooks/useAspirasi'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import type { AspirasiStatus, Aspirasi } from '@/types'
interface UploadedFile {
  name: string
  size: number
  type: string
  base64: string
}
interface FormUpdateAspirasiProps {
  aspirasi: Aspirasi
  onSuccess?: () => void
}

const statusOptions = [
  { value: 'BELUM_DITINDAKLANJUTI', labelKey: 'BELUM_DITINDAKLANJUTI' },
  { value: 'SEDANG_DITINDAKLANJUTI', labelKey: 'SEDANG_DITINDAKLANJUTI' },
  { value: 'SUDAH_DITINDAKLANJUTI', labelKey: 'SUDAH_DITINDAKLANJUTI' },
  { value: 'TIDAK_BISA_DITINDAKLANJUTI', labelKey: 'TIDAK_BISA_DITINDAKLANJUTI' },
]

export const FormUpdateAspirasi = ({
  aspirasi,
  onSuccess,
}: FormUpdateAspirasiProps): React.ReactNode => {
  const t = useTranslations('Aspirasi')
  const c = useTranslations('Common')
  const { trigger, isMutating } = useUpdateStatus(aspirasi.id)

  const [status, setStatus] = useState<AspirasiStatus>(aspirasi.status)
  const [catatan, setCatatan] = useState('')
  const [lampiranFiles, setLampiranFiles] = useState<UploadedFile[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await trigger({
      status: status as AspirasiStatus,
      catatan: catatan,
      lampiran: lampiranFiles.map((f) => f.base64),
      kirim_email: false,
      kirim_telepon: false,
      pelapor_email: aspirasi.pelapor_email,
      pelapor_telepon: aspirasi.pelapor_telepon,
    })
    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="status"
        label={c('status')}
        options={statusOptions.map((opt) => ({
          value: opt.value,
          label: t(opt.labelKey),
        }))}
        value={status}
        onChange={(e) => setStatus(e.target.value as AspirasiStatus)}
      />

      <div>
        <label
          htmlFor="catatan"
          className="block text-sm font-medium text-[var(--color-text)] mb-1"
        >
          {t('catatanTindakLanjut')}
        </label>
        <textarea
          id="catatan"
          rows={3}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Masukkan catatan tindak lanjut"
        />
      </div>

      <FileUpload
        label={t('buktiTindakLanjut')}
        value={lampiranFiles}
        onChange={setLampiranFiles}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isMutating}>
          {isMutating ? c('loading') : c('save')}
        </Button>
      </div>
    </form>
  )
}
