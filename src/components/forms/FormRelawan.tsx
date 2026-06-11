'use client'
import React, { useState } from 'react'

import { useRouter } from '@/routing'
import { useCreateRelawan } from '@/hooks/useRelawan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import useSWR from 'swr'

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

const JENIS_KELAMIN_OPTIONS = [
  { value: 'LAKI_LAKI', label: 'Laki-laki' },
  { value: 'PEREMPUAN', label: 'Perempuan' },
]

const POSISI_OPTIONS = [
  { value: 'KOORDINATOR_RW', label: 'Koordinator RW' },
  { value: 'KOORDINATOR_RT', label: 'Koordinator RT' },
  { value: 'KOORDINATOR_KELURAHAN', label: 'Koordinator Kelurahan' },
  { value: 'KOORDINATOR_KECAMATAN', label: 'Koordinator Kecamatan' },
  { value: 'FKDM', label: 'FKDM' },
  { value: 'LMK', label: 'LMK' },
  { value: 'TOKOH_MASYARAKAT', label: 'Tokoh Masyarakat' },
  { value: 'PROFESIONAL', label: 'Profesional' },
]

export const FormRelawan = (): React.ReactNode => {
  const router = useRouter()
  const { trigger, isMutating } = useCreateRelawan()

  const [nik, setNik] = useState('')
  const [nama, setNama] = useState('')
  const [noTelepon, setNoTelepon] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('')
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [jalan, setJalan] = useState('')
  const [rt, setRt] = useState('')
  const [rw, setRw] = useState('')
  const [posisi, setPosisi] = useState('')
  const [fotoBase64, setFotoBase64] = useState('')
  const [fotoName, setFotoName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : null,
    fetcher
  )
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : null,
    fetcher
  )

  const kotaMap = Object.fromEntries(kotaList.map((k) => [k.id, k.nama]))
  const kecamatanMap = Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama]))
  const kelurahanMap = Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama]))

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))
  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, foto: 'Hanya file PNG/JPG/JPEG' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFotoBase64(reader.result as string)
      setFotoName(file.name)
      setErrors((prev) => {
        const next = { ...prev }
        delete next.foto
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!nik) errs.nik = 'Wajib diisi'
    if (!nama) errs.nama = 'Wajib diisi'
    if (!noTelepon) errs.noTelepon = 'Wajib diisi'
    if (!jenisKelamin) errs.jenisKelamin = 'Wajib diisi'
    if (!kecamatanId) errs.kecamatan = 'Wajib diisi'
    if (!kelurahanId) errs.kelurahan = 'Wajib diisi'
    if (!posisi) errs.posisi = 'Wajib diisi'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await trigger({
      nik,
      nama,
      no_telepon: noTelepon,
      jenis_kelamin: jenisKelamin as any,
      kota_kabupaten: kotaMap[kotaId],
      kecamatan: kecamatanMap[kecamatanId],
      kelurahan: kelurahanMap[kelurahanId],
      alamat: `${jalan} RT ${rt} RW ${rw}`.trim(),
      posisi: posisi as any,
      foto: fotoBase64 || undefined,
    })

    router.push('/admin/relawan')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="nik"
        label="NIK"
        value={nik}
        onChange={(e) => setNik(e.target.value)}
        error={errors.nik}
        required
      />
      <Input
        id="nama"
        label="Nama Lengkap"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        error={errors.nama}
        required
      />
      <Input
        id="no_telepon"
        label="No. Telepon"
        type="tel"
        value={noTelepon}
        onChange={(e) => setNoTelepon(e.target.value)}
        error={errors.noTelepon}
        required
      />
      <Select
        id="jenis_kelamin"
        label="Jenis Kelamin"
        placeholder="Pilih jenis kelamin"
        options={JENIS_KELAMIN_OPTIONS}
        value={jenisKelamin}
        onChange={(e) => setJenisKelamin(e.target.value)}
        error={errors.jenisKelamin}
      />
      <Select
        id="posisi"
        label="Posisi"
        placeholder="Pilih posisi"
        options={POSISI_OPTIONS}
        value={posisi}
        onChange={(e) => setPosisi(e.target.value)}
        error={errors.posisi}
      />
      <Select
        id="kota"
        label="Kota/Kabupaten"
        placeholder="Pilih Kota/Kabupaten"
        options={kotaOptions}
        value={kotaId}
        onChange={(e) => {
          setKotaId(e.target.value)
          setKecamatanId('')
        }}
        error={errors.kota}
      />
      <Select
        id="kecamatan"
        label="Kecamatan"
        placeholder={kotaId ? 'Pilih kecamatan' : 'Pilih kota terlebih dahulu'}
        options={kecamatanOptions}
        value={kecamatanId}
        onChange={(e) => {
          setKecamatanId(e.target.value)
          setKelurahanId('')
        }}
        error={errors.kecamatan}
        disabled={!kotaId}
      />
      <Select
        id="kelurahan"
        label="Kelurahan"
        placeholder={kecamatanId ? 'Pilih kelurahan' : 'Pilih kecamatan terlebih dahulu'}
        options={kelurahanOptions}
        value={kelurahanId}
        onChange={(e) => setKelurahanId(e.target.value)}
        error={errors.kelurahan}
        disabled={!kecamatanId}
      />
      <Input
        id="jalan"
        label="Alamat (Jalan)"
        placeholder="Masukkan nama jalan"
        value={jalan}
        onChange={(e) => setJalan(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="rt"
          label="RT"
          placeholder="Contoh: 001"
          value={rt}
          onChange={(e) => setRt(e.target.value)}
        />
        <Input
          id="rw"
          label="RW"
          placeholder="Contoh: 005"
          value={rw}
          onChange={(e) => setRw(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Upload Foto
        </label>
        <input
          id="foto"
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          onChange={handleFileChange}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] file:mr-3 file:rounded file:border-0 file:bg-[var(--color-primary-light)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[var(--color-primary)]"
        />
        {fotoName && (
          <p className="text-xs text-[var(--color-text-secondary)]">Terpilih: {fotoName}</p>
        )}
        {errors.foto && <p className="text-xs text-[var(--color-danger)]">{errors.foto}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={isMutating}>
          {isMutating ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
