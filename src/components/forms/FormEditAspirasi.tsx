'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Aspirasi, SumberAspirasi } from '@/types'
import { FileUpload } from '../ui/file-upload'

interface FormEditAspirasiProps {
  aspirasi: Aspirasi
  onSuccess?: () => void
}

const sumberOptions = [
  { value: 'LEMBAR_ASPIRASI_RESES', label: 'Lembar Aspirasi Reses' },
  { value: 'LEMBAR_ASPIRASI_SOSPERDA', label: 'Lembar Aspirasi Sosperda' },
  { value: 'ASPIRASI_PROPOSAL_LANGSUNG', label: 'Aspirasi Proposal Langsung' },
  { value: 'KOORDINASI_DINAS_TERKAIT', label: 'Koordinasi Dinas Terkait' },
  { value: 'USULAN_MUSRENBANG_DEWAN', label: 'Usulan Musrenbang Dewan' },
  { value: 'CALL_CENTER', label: 'Call Center' },
  { value: 'LAINNYA', label: 'Lainnya' }, // Opsi tambahan
]

export const FormEditAspirasi = ({ aspirasi, onSuccess }: FormEditAspirasiProps): React.ReactNode => {
  const [loading, setLoading] = useState(false)
  const [pelaporNama, setPelaporNama] = useState(aspirasi.pelapor_nama)
  const [id_laporan] = useState(aspirasi.id_laporan)
  const [pelaporTelepon, setPelaporTelepon] = useState(aspirasi.pelapor_telepon)
  const [pelaporEmail, setPelaporEmail] = useState(aspirasi.pelapor_email)
  const [deskripsi, setDeskripsi] = useState(aspirasi.deskripsi)
  const [kategoriUsulan, setKategoriUsulan] = useState(aspirasi.kategori_usulan)
  const [jenisUsulan, setJenisUsulan] = useState(aspirasi.jenis_usulan)
  const [jenisReses, setJenisReses] = useState(aspirasi.jenis_reses)
  const [tindakLanjut, setTindakLanjut] = useState(aspirasi.tindak_lanjut)
  const [alamat, setAlamat] = useState(aspirasi.lokasi ?? '')
  const [lampiran, setLampiran] = useState<string[]>(
    Array.isArray(aspirasi.lampiran)
      ? aspirasi.lampiran
      : typeof aspirasi.lampiran === 'string' && aspirasi.lampiran
        ? [aspirasi.lampiran]
        : []
  )

  // Checking apakah nilai `sumber` dari props ada di opsi standar
  const isStandardOption = (sumberOptions as { value: string; label: string }[])
    .some((opt) => opt.value === (aspirasi.sumber as string) && opt.value !== 'LAINNYA')

  // State untuk Dropdown
  const [sumber, setSumber] = useState<string>(
    isStandardOption ? aspirasi.sumber : 'LAINNYA'
  )

  // State untuk Input Teks Kustom
  const [sumberLainnya, setSumberLainnya] = useState<string>(
    isStandardOption ? '' : aspirasi.sumber || ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Tentukan sumber akhir yang dikirim ke backend
    const finalSumber = sumber === 'LAINNYA' ? sumberLainnya : sumber

    try {
      const res = await fetch(`/api/aspirasi/${aspirasi.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pelapor_nama: pelaporNama,
          pelapor_telepon: pelaporTelepon,
          pelapor_email: pelaporEmail,
          deskripsi,
          kategori_usulan: kategoriUsulan,
          jenis_usulan: jenisUsulan,
          jenis_reses: jenisReses,
          tindak_lanjut: tindakLanjut,
          sumber: finalSumber as SumberAspirasi,
          alamat,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      if (onSuccess) onSuccess()
    } catch {
      alert('Gagal menyimpan perubahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="id_laporan"
        label="ID Laporan"
        value={id_laporan}
        disabled
        className="bg-gray-100 text-gray-500"
      />
      <Input
        id="pelapor_nama"
        label="Nama Pelapor"
        placeholder="Masukkan nama lengkap pelapor"
        value={pelaporNama}
        onChange={(e) => setPelaporNama(e.target.value)}
        required
      />
      <Input
        id="pelapor_telepon"
        label="No. Telepon"
        placeholder="Contoh: 081234567890"
        value={pelaporTelepon}
        onChange={(e) => setPelaporTelepon(e.target.value)}
      />
      <Input
        id="pelapor_email"
        label="Email"
        placeholder="Contoh: nama@email.com"
        value={pelaporEmail}
        onChange={(e) => setPelaporEmail(e.target.value)}
      />

      {/* SELECT SUMBER ASPIRASI */}
      <Select
        id="sumber"
        label="Sumber Aspirasi"
        placeholder="Pilih sumber aspirasi"
        options={sumberOptions}
        value={sumber}
        onChange={(e) => setSumber(e.target.value)}
      />

      {/* INPUT TAMBAHAN JIKA 'LAINNYA' DIPILIH */}
      {sumber === 'LAINNYA' && (
        <Input
          id="sumber_lainnya"
          label="Sumber Aspirasi Lainnya"
          placeholder="Tuliskan sumber aspirasi kustom..."
          value={sumberLainnya}
          onChange={(e) => setSumberLainnya(e.target.value)}
          required
        />
      )}

      <div>
        <label htmlFor="deskripsi" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          rows={3}
          placeholder="Tuliskan deskripsi lengkap aspirasi..."
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-secondary)]"
        />
      </div>

      <Input
        id="kategori_usulan"
        label="Kategori Usulan"
        placeholder="Contoh: Infrastruktur / Pendidikan"
        value={kategoriUsulan}
        onChange={(e) => setKategoriUsulan(e.target.value)}
      />
      <Input
        id="jenis_usulan"
        label="Jenis Usulan"
        placeholder="Contoh: Perbaikan Jalan"
        value={jenisUsulan}
        onChange={(e) => setJenisUsulan(e.target.value)}
      />
      <Input
        id="jenis_reses"
        label="Jenis Reses"
        placeholder="Contoh: Reses Masa Persidangan I"
        value={jenisReses}
        onChange={(e) => setJenisReses(e.target.value)}
      />
      <Input
        id="tindak_lanjut"
        label="Tindak Lanjut"
        placeholder="Status tindak lanjut otomatis"
        value={tindakLanjut}
        onChange={(e) => setTindakLanjut(e.target.value)}
        disabled
        className="bg-gray-100 text-gray-500"
      />
      <Input
        id="alamat"
        label="Alamat / Lokasi"
        placeholder="Masukkan alamat lengkap lokasi kejadian/usulan"
        value={alamat}
        onChange={(e) => setAlamat(e.target.value)}
      />
      <FileUpload
        label="Upload Foto / Dokumen Lampiran"
        value={lampiran}
        onChange={(files) => setLampiran(Array.isArray(files) ? files : [files])}
        multiple
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  )
}