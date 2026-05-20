'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { useCreateAspirasi } from '@/hooks/useAspirasi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { useRouter } from '@/routing'
import type { SumberAspirasi } from '@/types'
interface UploadedFile {
  name: string
  size: number
  type: string
  base64: string
}
const sumberOptions = [
  { value: 'LEMBAR_ASPIRASI_RESES', labelKey: 'LEMBAR_ASPIRASI_RESES' },
  { value: 'LEMBAR_ASPIRASI_SOSPERDA', labelKey: 'LEMBAR_ASPIRASI_SOSPERDA' },
  { value: 'ASPIRASI_PROPOSAL_LANGSUNG', labelKey: 'ASPIRASI_PROPOSAL_LANGSUNG' },
  { value: 'KOORDINASI_DINAS_TERKAIT', labelKey: 'KOORDINASI_DINAS_TERKAIT' },
  { value: 'USULAN_MUSRENBANG_DEWAN', labelKey: 'USULAN_MUSRENBANG_DEWAN' },
  { value: 'CALL_CENTER', labelKey: 'CALL_CENTER' },
]

interface FormAspirasiProps {
  onSuccess?: () => void
}

export const FormAspirasi = ({ onSuccess }: FormAspirasiProps): React.ReactNode => {
  const t = useTranslations('Aspirasi')
  const s = useTranslations('Sumber')
  const c = useTranslations('Common')
  const router = useRouter()
  const { trigger, isMutating } = useCreateAspirasi()

  const [sumber, setSumber] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [pelaporNama, setPelaporNama] = useState('')
  const [pelaporEmail, setPelaporEmail] = useState('')
  const [pelaporTelepon, setPelaporTelepon] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!sumber) errs.sumber = c('required')
    if (!deskripsi) errs.deskripsi = c('required')
    if (!pelaporNama) errs.pelapor_nama = c('required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await trigger({
      sumber: sumber as SumberAspirasi,
      deskripsi,
      pelapor_nama: pelaporNama,
      pelapor_email: pelaporEmail,
      pelapor_telepon: pelaporTelepon,
      lampiran: uploadedFiles.map((f) => f.base64),
    })

    if (onSuccess) onSuccess()
    router.push('/aspirasi')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="sumber"
        label={t('sumber')}
        placeholder="Pilih sumber aspirasi"
        options={sumberOptions.map((opt) => ({
          value: opt.value,
          label: s(opt.labelKey),
        }))}
        value={sumber}
        onChange={(e) => setSumber(e.target.value)}
        error={errors.sumber}
      />

      <div>
        <label
          htmlFor="deskripsi"
          className="block text-sm font-medium text-[var(--color-text)] mb-1"
        >
          {t('deskripsi')}
        </label>
        <textarea
          id="deskripsi"
          rows={4}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Masukkan deskripsi aspirasi"
        />
        {errors.deskripsi && (
          <p className="text-xs text-[var(--color-danger)] mt-1">
            {errors.deskripsi}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          id="pelapor_nama"
          label={t('pelapor')}
          placeholder="Nama pelapor"
          value={pelaporNama}
          onChange={(e) => setPelaporNama(e.target.value)}
          error={errors.pelapor_nama}
        />
        <Input
          id="pelapor_email"
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={pelaporEmail}
          onChange={(e) => setPelaporEmail(e.target.value)}
        />
        <Input
          id="pelapor_telepon"
          label="Telepon"
          type="tel"
          placeholder="08xxxx"
          value={pelaporTelepon}
          onChange={(e) => setPelaporTelepon(e.target.value)}
        />
      </div>

      <FileUpload
        label={t('lampiran')}
        value={uploadedFiles}
        onChange={setUploadedFiles}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {c('cancel')}
        </Button>
        <Button type="submit" disabled={isMutating}>
          {isMutating ? c('loading') : c('save')}
        </Button>
      </div>
    </form>
  )
}
