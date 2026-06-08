'use client'
import React, { useState } from 'react'

import { useRouter } from '@/routing'
import { useCreateRelawan } from '@/hooks/useRelawan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  getKecamatanOptions,
  getKelurahanByKecamatanId,
} from '@/utils/masterWilayah'

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
  const [kota, setKota] = useState('Jakarta Selatan')
  const [kecamatan, setKecamatan] = useState('')
  const [kelurahan, setKelurahan] = useState('')
  const [jalan, setJalan] = useState('')
  const [rt, setRt] = useState('')
  const [rw, setRw] = useState('')
  const [posisi, setPosisi] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const kecamatanOptions = getKecamatanOptions()
  const kelurahanOptions = kecamatan ? getKelurahanByKecamatanId(kecamatan) : []

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!nik) errs.nik = 'Wajib diisi'
    if (!nama) errs.nama = 'Wajib diisi'
    if (!noTelepon) errs.noTelepon = 'Wajib diisi'
    if (!jenisKelamin) errs.jenisKelamin = 'Wajib diisi'
    if (!kecamatan) errs.kecamatan = 'Wajib diisi'
    if (!kelurahan) errs.kelurahan = 'Wajib diisi'
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
      kota_kabupaten: kota,
      kecamatan: kecamatanOptions.find((k) => k.value === kecamatan)?.label ?? kecamatan,
      kelurahan: kelurahanOptions.find((k) => k.value === kelurahan)?.label ?? kelurahan,
      alamat: `${jalan} RT ${rt} RW ${rw}`.trim(),
      posisi: posisi as any,
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
      <Input
        id="kota"
        label="Kota/Kabupaten"
        value={kota}
        onChange={(e) => setKota(e.target.value)}
      />
      <Select
        id="kecamatan"
        label="Kecamatan"
        placeholder="Pilih kecamatan"
        options={kecamatanOptions}
        value={kecamatan}
        onChange={(e) => {
          setKecamatan(e.target.value)
          setKelurahan('')
        }}
        error={errors.kecamatan}
      />
      <Select
        id="kelurahan"
        label="Kelurahan"
        placeholder={kecamatan ? 'Pilih kelurahan' : 'Pilih kecamatan terlebih dahulu'}
        options={kelurahanOptions}
        value={kelurahan}
        onChange={(e) => setKelurahan(e.target.value)}
        error={errors.kelurahan}
        disabled={!kecamatan}
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
