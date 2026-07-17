'use client'
import React, { useState, useEffect } from 'react'

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

interface FormRelawanInitialData {
  id: string
  nik: string
  nama: string
  no_telepon: string
  jenis_kelamin: string
  posisi: string
  alamat: string
  domisili_sekarang?: string
  foto: string
  kota_kabupaten: string
  kecamatan: string
  kelurahan: string
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
  { value: 'LAINNYA', label: 'Lainnya' },
]

function parseAlamat(alamat: string): { jalan: string; rt: string; rw: string } {
  const match = alamat.match(/^(.+?)\s*RT\s+(\S+)\s+RW\s+(\S+)$/)
  if (match) return { jalan: match[1].trim(), rt: match[2], rw: match[3] }
  return { jalan: alamat, rt: '', rw: '' }
}

export const FormRelawan = ({ initialData }: { initialData?: FormRelawanInitialData }): React.ReactNode => {
  const router = useRouter()
  const { trigger, isMutating } = useCreateRelawan()
  const isEdit = !!initialData

  const [nik, setNik] = useState(initialData?.nik ?? '')
  const [nama, setNama] = useState(initialData?.nama ?? '')
  const [noTelepon, setNoTelepon] = useState(initialData?.no_telepon ?? '')
  const [jenisKelamin, setJenisKelamin] = useState(initialData?.jenis_kelamin ?? '')
  const [posisi, setPosisi] = useState(initialData?.posisi ?? '')
  const [posisiLainnya, setPosisiLainnya] = useState('')
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [jalan, setJalan] = useState('')
  const [rt, setRt] = useState('')
  const [rw, setRw] = useState('')
  const [fotoBase64, setFotoBase64] = useState(initialData?.foto ?? '')
  const [fotoName, setFotoName] = useState(initialData?.foto ? 'foto-existing' : '')
  const [domisiliSesuaiKtp, setDomisiliSesuaiKtp] = useState('')
  const [domisiliSekarang, setDomisiliSekarang] = useState(initialData?.domisili_sekarang ?? '')
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

  useEffect(() => {
    if (initialData && kotaList.length > 0) {
      const found = kotaList.find((k) => k.nama === initialData.kota_kabupaten)
      if (found) setKotaId(found.id)
    }
  }, [initialData, kotaList])

  useEffect(() => {
    if (initialData && kecamatanList.length > 0) {
      const found = kecamatanList.find((k) => k.nama === initialData.kecamatan)
      if (found) setKecamatanId(found.id)
    }
  }, [initialData, kecamatanList])

  useEffect(() => {
    if (initialData && kelurahanList.length > 0) {
      const found = kelurahanList.find((k) => k.nama === initialData.kelurahan)
      if (found) setKelurahanId(found.id)
    }
  }, [initialData, kelurahanList])

  useEffect(() => {
    if (initialData) {
      const parsed = parseAlamat(initialData.alamat)
      setJalan(parsed.jalan)
      setRt(parsed.rt)
      setRw(parsed.rw)
    }
  }, [initialData])

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

    const posisiFinal = posisi === 'LAINNYA' ? posisiLainnya : posisi

    if (isEdit && initialData) {
      await fetch(`/api/relawan/${initialData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik,
          nama,
          no_telepon: noTelepon,
          jenis_kelamin: jenisKelamin,
          posisi: posisiFinal,
          alamat: `${jalan} RT ${rt} RW ${rw}`.trim(),
          domisili_sekarang: domisiliSekarang,
          kota_kabupaten: kotaMap[kotaId],
          kecamatan: kecamatanMap[kecamatanId],
          kelurahan: kelurahanMap[kelurahanId],
        }),
      })
      router.push('/admin/relawan')
      return
    }

    await trigger({
      nik,
      nama,
      no_telepon: noTelepon,
      jenis_kelamin: jenisKelamin as any,
      kota_kabupaten: kotaMap[kotaId],
      kecamatan: kecamatanMap[kecamatanId],
      kelurahan: kelurahanMap[kelurahanId],
      alamat: `${jalan} RT ${rt} RW ${rw}`.trim(),
      domisili_sekarang: domisiliSekarang,
      posisi: posisiFinal as any,
      foto: fotoBase64 || undefined,
    })

    router.push('/admin/relawan')
  }

  const FieldRow = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
    <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
      <label className="text-sm font-medium text-[var(--color-text)] pt-2 text-left">{label}</label>
      <div>
        {children}
        {error && <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>}
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <FieldRow label="NIK" error={errors.nik}>
        <Input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} />
        <span className="text-xs text-[var(--color-text-secondary)]">(Boleh dikosongkan)</span>
      </FieldRow>

      <FieldRow label="Nama Lengkap" error={errors.nama}>
        <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
      </FieldRow>

      <FieldRow label="No. Telepon" error={errors.noTelepon}>
        <Input id="no_telepon" type="tel" value={noTelepon} onChange={(e) => setNoTelepon(e.target.value)} required />
      </FieldRow>

      <FieldRow label="Jenis Kelamin" error={errors.jenisKelamin}>
        <Select id="jenis_kelamin" placeholder="Pilih jenis kelamin" options={JENIS_KELAMIN_OPTIONS} value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} />
      </FieldRow>

      <FieldRow label="Posisi" error={errors.posisi}>
        <Select id="posisi" placeholder="Pilih posisi" options={POSISI_OPTIONS} value={posisi} onChange={(e) => { setPosisi(e.target.value); if (e.target.value !== 'LAINNYA') setPosisiLainnya('') }} />
        {posisi === 'LAINNYA' && (
          <Input id="posisi_lainnya" placeholder="Tuliskan posisi" value={posisiLainnya} onChange={(e) => setPosisiLainnya(e.target.value)} required />
        )}
      </FieldRow>

      <FieldRow label="Kota/Kabupaten">
        <Select id="kota" placeholder="Pilih Kota/Kabupaten" options={kotaOptions} value={kotaId} onChange={(e) => { setKotaId(e.target.value); setKecamatanId('') }} />
      </FieldRow>

      <FieldRow label="Kecamatan" error={errors.kecamatan}>
        <Select id="kecamatan" placeholder={kotaId ? 'Pilih kecamatan' : 'Pilih kota terlebih dahulu'} options={kecamatanList.map((k) => ({ value: k.id, label: k.nama }))} value={kecamatanId} onChange={(e) => { setKecamatanId(e.target.value); setKelurahanId('') }} disabled={!kotaId} />
      </FieldRow>

      <FieldRow label="Kelurahan" error={errors.kelurahan}>
        <Select id="kelurahan" placeholder={kecamatanId ? 'Pilih kelurahan' : 'Pilih kecamatan terlebih dahulu'} options={kelurahanList.map((k) => ({ value: k.id, label: k.nama }))} value={kelurahanId} onChange={(e) => setKelurahanId(e.target.value)} disabled={!kecamatanId} />
      </FieldRow>

      <FieldRow label="Domisili sesuai KTP?">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="domisili_ktp" value="Ya" checked={domisiliSesuaiKtp === 'Ya'} onChange={() => { setDomisiliSesuaiKtp('Ya'); setDomisiliSekarang('') }} className="accent-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text)]">Ya</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="domisili_ktp" value="Tidak" checked={domisiliSesuaiKtp === 'Tidak'} onChange={() => setDomisiliSesuaiKtp('Tidak')} className="accent-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text)]">Tidak</span>
          </label>
        </div>
      </FieldRow>

      {domisiliSesuaiKtp === 'Tidak' && (
        <FieldRow label="Domisili Sekarang">
          <Input id="domisili_sekarang" value={domisiliSekarang} onChange={(e) => setDomisiliSekarang(e.target.value)} placeholder="Masukkan domisili saat ini" />
        </FieldRow>
      )}

      <FieldRow label="Alamat Sesuai KTP">
        <Input id="jalan" value={jalan} onChange={(e) => setJalan(e.target.value)} placeholder="Masukkan nama jalan" />
      </FieldRow>

      <FieldRow label="RT / RW">
        <div className="grid grid-cols-2 gap-2">
          <Input id="rt" type="number" value={rt} onChange={(e) => setRt(e.target.value)} placeholder="RT, contoh: 001" />
          <Input id="rw" type="number" value={rw} onChange={(e) => setRw(e.target.value)} placeholder="RW, contoh: 005" />
        </div>
      </FieldRow>

      <FieldRow label="Upload Foto Diri">
        <input id="foto" type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={handleFileChange}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] file:mr-3 file:rounded file:border-0 file:bg-[var(--color-primary-light)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[var(--color-primary)]" />
        <span className="text-xs text-[var(--color-text-secondary)]">Format PNG/JPG/JPEG, boleh dikosongkan</span>
        {fotoName && <p className="text-xs text-[var(--color-text-secondary)]">{fotoBase64.startsWith('data:') ? 'Foto tersimpan' : `Terpilih: ${fotoName}`}</p>}
        {errors.foto && <p className="text-xs text-[var(--color-danger)]">{errors.foto}</p>}
      </FieldRow>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={isMutating}>
          {isMutating ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
