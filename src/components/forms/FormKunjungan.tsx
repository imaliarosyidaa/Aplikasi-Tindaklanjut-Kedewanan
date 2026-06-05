'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { useCreateKunjungan } from '@/hooks/useKunjungan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  getKecamatanOptions,
  getKelurahanByKecamatanId,
} from '@/utils/masterWilayah'
import { useRouter } from '@/routing'

const JENIS_KEGIATAN_OPTIONS = [
  { value: 'reses', label: 'Kegiatan reses (serap aspirasi masyarakat)' },
  { value: 'sosperda', label: 'Sosperda (fungsi pengawasan produk hukum daerah DKI Jakarta)' },
]

export const FormKunjungan = (): React.ReactNode => {
  const t = useTranslations('Kunjungan')
  const c = useTranslations('Common')
  const router = useRouter()
  const { trigger, isMutating } = useCreateKunjungan()

  const [jenisKegiatan, setJenisKegiatan] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [jam, setJam] = useState('')
  const [jalan, setJalan] = useState('')
  const [kecamatan, setKecamatan] = useState('')
  const [kelurahan, setKelurahan] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const kelurahanOptions = kecamatan ? getKelurahanByKecamatanId(kecamatan) : []

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!jenisKegiatan) errs.jenisKegiatan = c('required')
    if (!tanggal) errs.tanggal = c('required')
    if (!jam) errs.jam = c('required')
    if (!jalan) errs.jalan = c('required')
    if (!kecamatan) errs.kecamatan = c('required')
    if (!kelurahan) errs.kelurahan = c('required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await trigger({
      jenis_kegiatan: jenisKegiatan,
      tanggal,
      jam,
      jalan,
      kelurahan: getKelurahanByKecamatanId(kecamatan).find((k) => k.value === kelurahan)?.label ?? kelurahan,
      kecamatan: getKecamatanOptions().find((k) => k.value === kecamatan)?.label ?? kecamatan,
      kota: 'Jakarta Selatan',
    })

    router.push('/kunjungan/list')
  }

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKecamatan(e.target.value)
    setKelurahan('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="jenis_kegiatan"
        label="Jenis Kegiatan"
        placeholder="Pilih jenis kegiatan"
        options={JENIS_KEGIATAN_OPTIONS}
        value={jenisKegiatan}
        onChange={(e) => setJenisKegiatan(e.target.value)}
        error={errors.jenisKegiatan}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="tanggal"
          label={t('tanggal')}
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          error={errors.tanggal}
        />
        <Input
          id="jam"
          label={t('jam')}
          type="time"
          value={jam}
          onChange={(e) => setJam(e.target.value)}
          error={errors.jam}
        />
      </div>

      <Input
        id="jalan"
        label={t('jalan')}
        placeholder="Masukkan nama jalan"
        value={jalan}
        onChange={(e) => setJalan(e.target.value)}
        error={errors.jalan}
      />

      <Select
        id="kecamatan"
        label={t('kecamatan')}
        placeholder="Pilih kecamatan"
        options={getKecamatanOptions()}
        value={kecamatan}
        onChange={handleKecamatanChange}
        error={errors.kecamatan}
      />

      <Select
        id="kelurahan"
        label={t('kelurahan')}
        placeholder={kecamatan ? 'Pilih kelurahan' : 'Pilih kecamatan terlebih dahulu'}
        options={kelurahanOptions}
        value={kelurahan}
        onChange={(e) => setKelurahan(e.target.value)}
        error={errors.kelurahan}
        disabled={!kecamatan}
      />

      <Input
        id="kota"
        label={t('kota')}
        value="Jakarta Selatan"
        disabled
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
