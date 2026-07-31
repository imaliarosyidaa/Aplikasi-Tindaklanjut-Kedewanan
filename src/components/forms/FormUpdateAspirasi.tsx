'use client'

import React, { useState } from 'react'
import { useUpdateStatus } from '@/hooks/useAspirasi'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import type { AspirasiStatus, Aspirasi } from '@/types'

interface FormUpdateAspirasiProps {
  aspirasi: Aspirasi
  onSuccess?: () => void
}

const statusOptions = [
  { value: 'BELUM_DITINDAKLANJUTI', label: 'Belum Ditindaklanjuti' },
  { value: 'SEDANG_DITINDAKLANJUTI', label: 'Sedang Ditindaklanjuti' },
  { value: 'SUDAH_DITINDAKLANJUTI', label: 'Sudah Ditindaklanjuti' },
  { value: 'TIDAK_BISA_DITINDAKLANJUTI', label: 'Tidak Bisa Ditindaklanjuti' },
]

export const FormUpdateAspirasi = ({
  aspirasi,
  onSuccess,
}: FormUpdateAspirasiProps): React.ReactNode => {
  const { trigger, isMutating } = useUpdateStatus(aspirasi.id)

  const [status, setStatus] = useState<AspirasiStatus>(aspirasi.status)
  const [catatan, setCatatan] = useState('')
  const [lampiranFiles, setLampiranFiles] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await trigger({
      status: status as AspirasiStatus,
      catatan: catatan,
      lampiran: lampiranFiles,
      kirim_email: false,
      kirim_telepon: false,
      pelapor_email: aspirasi.pelapor_email,
      pelapor_telepon: aspirasi.pelapor_telepon,
    })
    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* GRID 2 KOLOM: items-stretch agar tinggi kedua kolom sama persis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

        {/* KOLOM KIRI: Select Status & Textarea Catatan (Memanjang Vertikal) */}
        <div className="flex flex-col gap-4 h-full">
          <Select
            id="status"
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as AspirasiStatus)}
          />

          <div className="flex-1 flex flex-col min-h-0">
            <label
              htmlFor="catatan"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Catatan Tindak Lanjut
            </label>
            <textarea
              id="catatan"
              className="w-full flex-1 min-h-[160px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-y"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Masukkan catatan tindak lanjut"
            />
          </div>
        </div>

        {/* KOLOM KANAN: Upload Bukti Tindak Lanjut */}
        <div className="flex flex-col h-full">
          <FileUpload
            label="Bukti Tindak Lanjut"
            value={lampiranFiles}
            onChange={setLampiranFiles}
          />
        </div>
      </div>

      {/* FOOTER ACTION: Tombol Simpan di Bawah Melintang Rapi */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <Button type="submit" disabled={isMutating} className="px-6 cursor-pointer">
          {isMutating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
          ) : (
            'Simpan'
          )}
        </Button>
      </div>
    </form>
  )
}