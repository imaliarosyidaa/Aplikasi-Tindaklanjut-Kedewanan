'use client'

import React, { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Aspirasi, SumberAspirasi } from '@/types'
import { FileUpload } from '../ui/file-upload'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KotaItem {
  id: string
  nama: string
}
interface KecamatanItem {
  id: string
  nama: string
}
interface KelurahanItem {
  id: string
  nama: string
}

const statusLabel: Record<string, string> = {
  BELUM_DITINDAKLANJUTI: 'Belum Ditindaklanjuti',
  SEDANG_DITINDAKLANJUTI: 'Sedang Ditindaklanjuti',
  SUDAH_DITINDAKLANJUTI: 'Sudah Ditindaklanjuti',
  TIDAK_BISA_DITINDAKLANJUTI: 'Tidak Bisa Ditindaklanjuti',
  SELESAI: 'Selesai',
}

const toDateInputValue = (iso: string): string => {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

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
  const [nik, setNik] = useState(aspirasi.nik ?? '')
  const [pelaporNama, setPelaporNama] = useState(aspirasi.pelapor_nama)
  const [id_laporan] = useState(aspirasi.id_laporan)
  const [pelaporTelepon, setPelaporTelepon] = useState(aspirasi.pelapor_telepon)
  const [pelaporEmail, setPelaporEmail] = useState(aspirasi.pelapor_email)
  const [deskripsi, setDeskripsi] = useState(aspirasi.deskripsi)
  const [kategoriUsulan, setKategoriUsulan] = useState(aspirasi.kategori_usulan)
  const [jenisUsulan, setJenisUsulan] = useState(aspirasi.jenis_usulan)
  const [jenisReses, setJenisReses] = useState(aspirasi.jenis_reses)
  const [alamat, setAlamat] = useState(aspirasi.lokasi ?? '')
  const [tanggalDibuat, setTanggalDibuat] = useState(toDateInputValue(aspirasi.tanggal_dibuat))
  const [lampiran, setLampiran] = useState<string[]>(
    Array.isArray(aspirasi.lampiran)
      ? aspirasi.lampiran
      : typeof aspirasi.lampiran === 'string' && aspirasi.lampiran
        ? [aspirasi.lampiran]
        : [],
  )

  // Pilihan user (mengalahkan default saat berubah)
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')

  // Master data wilayah (independen, tidak saling cascade)
  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : '/api/kecamatan',
    fetcher,
  )
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : '/api/kelurahan',
    fetcher,
  )

  // ID default di-resolve dari nama wilayah pada data aspirasi
  const defaultKotaId = useMemo(
    () => kotaList.find((k) => k.nama === aspirasi.kota)?.id ?? '',
    [kotaList, aspirasi.kota],
  )
  const defaultKecamatanId = useMemo(
    () => kecamatanList.find((k) => k.nama === aspirasi.kecamatan)?.id ?? '',
    [kecamatanList, aspirasi.kecamatan],
  )
  const defaultKelurahanId = useMemo(
    () => kelurahanList.find((k) => k.nama === aspirasi.kelurahan)?.id ?? '',
    [kelurahanList, aspirasi.kelurahan],
  )

  const finalKotaId = kotaId || defaultKotaId
  const finalKecamatanId = kecamatanId || defaultKecamatanId
  const finalKelurahanId = kelurahanId || defaultKelurahanId

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({
    value: k.id,
    label: k.nama,
  }))
  const kelurahanOptions = kelurahanList.map((k) => ({
    value: k.id,
    label: k.nama,
  }))

  // Checking apakah nilai `sumber` dari props ada di opsi standar
  const isStandardOption = (sumberOptions as { value: string; label: string }[]).some(
    (opt) => opt.value === (aspirasi.sumber as string) && opt.value !== 'LAINNYA',
  )

  // State untuk Dropdown
  const [sumber, setSumber] = useState<string>(isStandardOption ? aspirasi.sumber : 'LAINNYA')

  // State untuk Input Teks Kustom
  const [sumberLainnya, setSumberLainnya] = useState<string>(isStandardOption ? '' : aspirasi.sumber || '')

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
          nik,
          pelapor_nama: pelaporNama,
          pelapor_telepon: pelaporTelepon,
          pelapor_email: pelaporEmail,
          deskripsi,
          kategori_usulan: kategoriUsulan,
          jenis_usulan: jenisUsulan,
          jenis_reses: jenisReses,
          sumber: finalSumber as SumberAspirasi,
          alamat,
          tanggal_dibuat: tanggalDibuat,
          lampiran,
          kota_id: finalKotaId || null,
          kecamatan_id: finalKecamatanId || null,
          kelurahan_id: finalKelurahanId || null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      alert('Perubahan berhasil disimpan')
      if (onSuccess) onSuccess()
    } catch {
      alert('Gagal menyimpan perubahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="id_laporan" label="ID Laporan" value={id_laporan} disabled className="bg-gray-100 text-gray-500" />
      <Input
        id="status"
        label="Status"
        value={statusLabel[aspirasi.status] || aspirasi.status}
        disabled
        className="bg-gray-100 text-gray-500"
      />
      <Input
        id="nik"
        label="NIK"
        placeholder="Masukkan NIK pelapor"
        value={nik}
        onChange={(e) => setNik(e.target.value)}
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
        placeholder="Pembangunan / Pendidikan / Kesehatan / Kesejahteraan Sosial / Pekerjaan  / Dll"
        value={kategoriUsulan}
        onChange={(e) => setKategoriUsulan(e.target.value)}
      />
      <Input
        id="jenis_usulan"
        label="Jenis Usulan"
        placeholder="Pelatihan / Perbaikan Jalan / Pembuatan Drainase / Fasos / Fasum / Dll"
        value={jenisUsulan}
        onChange={(e) => setJenisUsulan(e.target.value)}
      />
      <Input
        id="jenis_reses"
        label="Jenis Reses"
        placeholder="Reses I / Reses II / Reses III"
        value={jenisReses}
        onChange={(e) => setJenisReses(e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          id="kota"
          label="Kota/Kabupaten"
          placeholder="Pilih kota/kabupaten"
          options={kotaOptions}
          value={finalKotaId}
          onChange={(e) => setKotaId(e.target.value)}
        />
        <Select
          id="kecamatan"
          label="Kecamatan"
          placeholder="Pilih kecamatan"
          options={kecamatanOptions}
          value={finalKecamatanId}
          onChange={(e) => setKecamatanId(e.target.value)}
        />
        <Select
          id="kelurahan"
          label="Kelurahan"
          placeholder="Pilih kelurahan"
          options={kelurahanOptions}
          value={finalKelurahanId}
          onChange={(e) => setKelurahanId(e.target.value)}
          disabled={!!kotaId}
        />
      </div>

      <Input
        id="tanggal_dibuat"
        label="Tanggal Dibuat"
        type="date"
        value={tanggalDibuat}
        onChange={(e) => setTanggalDibuat(e.target.value)}
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
