'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Aspirasi, SumberAspirasi } from '@/types'

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
]

export const FormEditAspirasi = ({ aspirasi, onSuccess }: FormEditAspirasiProps): React.ReactNode => {
  const [loading, setLoading] = useState(false)
  const [pelaporNama, setPelaporNama] = useState(aspirasi.pelapor_nama)
  const [pelaporTelepon, setPelaporTelepon] = useState(aspirasi.pelapor_telepon)
  const [pelaporEmail, setPelaporEmail] = useState(aspirasi.pelapor_email)
  const [deskripsi, setDeskripsi] = useState(aspirasi.deskripsi)
  const [kategoriUsulan, setKategoriUsulan] = useState(aspirasi.kategori_usulan)
  const [jenisUsulan, setJenisUsulan] = useState(aspirasi.jenis_usulan)
  const [jenisReses, setJenisReses] = useState(aspirasi.jenis_reses)
  const [tindakLanjut, setTindakLanjut] = useState(aspirasi.tindak_lanjut)
  const [sumber, setSumber] = useState<string>(aspirasi.sumber)
  const [alamat, setAlamat] = useState(aspirasi.lokasi ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
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
          sumber: sumber as SumberAspirasi,
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
      <Input id="pelapor_nama" label="Nama Pelapor" value={pelaporNama} onChange={(e) => setPelaporNama(e.target.value)} required />
      <Input id="pelapor_telepon" label="No. Telepon" value={pelaporTelepon} onChange={(e) => setPelaporTelepon(e.target.value)} />
      <Input id="pelapor_email" label="Email" value={pelaporEmail} onChange={(e) => setPelaporEmail(e.target.value)} />

      <Select id="sumber" label="Sumber Aspirasi" options={sumberOptions} value={sumber} onChange={(e) => setSumber(e.target.value)} />

      <div>
        <label htmlFor="deskripsi" className="block text-sm font-medium text-[var(--color-text)] mb-1">Deskripsi</label>
        <textarea id="deskripsi" rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <Input id="kategori_usulan" label="Kategori Usulan" value={kategoriUsulan} onChange={(e) => setKategoriUsulan(e.target.value)} />
      <Input id="jenis_usulan" label="Jenis Usulan" value={jenisUsulan} onChange={(e) => setJenisUsulan(e.target.value)} />
      <Input id="jenis_reses" label="Jenis Reses" value={jenisReses} onChange={(e) => setJenisReses(e.target.value)} />
      <Input id="tindak_lanjut" label="Tindak Lanjut" value={tindakLanjut} onChange={(e) => setTindakLanjut(e.target.value)} />
      <Input id="alamat" label="Alamat / Lokasi" value={alamat} onChange={(e) => setAlamat(e.target.value)} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  )
}
