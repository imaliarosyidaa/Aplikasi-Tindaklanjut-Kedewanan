'use client'
import React, { useState } from 'react'
import useSWR from 'swr'

import { useTranslations } from 'next-intl'
import { useCreateKunjungan } from '@/hooks/useKunjungan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useRouter } from '@/routing'

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
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [linkGmaps, setLinkGmaps] = useState('')
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!jenisKegiatan) errs.jenisKegiatan = c('required')
    if (!tanggal) errs.tanggal = c('required')
    if (!jam) errs.jam = c('required')
    if (!jalan) errs.jalan = c('required')
    if (!kotaId) errs.kota = c('required')
    if (!kecamatanId) errs.kecamatan = c('required')
    if (!kelurahanId) errs.kelurahan = c('required')
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
      kelurahan: kelurahanMap[kelurahanId],
      kecamatan: kecamatanMap[kecamatanId],
      kota: kotaMap[kotaId],
      link_gmaps: linkGmaps,
    })

    router.push('/admin/kunjungan/list')
  }

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKotaId(e.target.value)
    setKecamatanId('')
    setKelurahanId('')
  }

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKecamatanId(e.target.value)
    setKelurahanId('')
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
        id="kota"
        label={t('kota')}
        placeholder="Pilih kota"
        options={kotaOptions}
        value={kotaId}
        onChange={handleKotaChange}
        error={errors.kota}
      />

      <Select
        id="kecamatan"
        label={t('kecamatan')}
        placeholder={kotaId ? 'Pilih kecamatan' : 'Pilih kota terlebih dahulu'}
        options={kecamatanOptions}
        value={kecamatanId}
        onChange={handleKecamatanChange}
        error={errors.kecamatan}
        disabled={!kotaId}
      />

      <Select
        id="kelurahan"
        label={t('kelurahan')}
        placeholder={kecamatanId ? 'Pilih kelurahan' : 'Pilih kecamatan terlebih dahulu'}
        options={kelurahanOptions}
        value={kelurahanId}
        onChange={(e) => setKelurahanId(e.target.value)}
        error={errors.kelurahan}
        disabled={!kecamatanId}
      />

      <Input
        id="link_gmaps"
        label="Titik Lokasi (Google Maps)"
        placeholder="https://maps.google.com/?q=..."
        value={linkGmaps}
        onChange={(e) => setLinkGmaps(e.target.value)}
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
