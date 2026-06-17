'use client'
import React, { useState } from 'react'
import useSWR from 'swr'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useRouter } from '@/routing'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KotaItem { id: string; nama: string }
interface KecamatanItem { id: string; nama: string }
interface KelurahanItem { id: string; nama: string }

const JENIS_KEGIATAN_OPTIONS = [
  { value: 'reses', label: 'Kegiatan reses (serap aspirasi masyarakat)' },
  { value: 'sosperda', label: 'Sosperda (fungsi pengawasan produk hukum daerah DKI Jakarta)' },
]

export const FormKunjungan = (): React.ReactNode => {
  const t = useTranslations('Kunjungan')
  const c = useTranslations('Common')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Kunjungan fields
  const [tanggal, setTanggal] = useState('')
  const [jam, setJam] = useState('')
  const [jalan, setJalan] = useState('')
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [linkGmaps, setLinkGmaps] = useState('')

  // Kegiatan fields
  const [jenisKegiatan, setJenisKegiatan] = useState('')
  const [namaKegiatan, setNamaKegiatan] = useState('')
  const [isi, setIsi] = useState('')
  const [tempat, setTempat] = useState('')
  const [rt, setRt] = useState('')
  const [rw, setRw] = useState('')
  const [jumlahPeserta, setJumlahPeserta] = useState('')
  const [catatan, setCatatan] = useState('')

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
    if (!kotaId) errs.kota = c('required')
    if (!kecamatanId) errs.kecamatan = c('required')
    if (!kelurahanId) errs.kelurahan = c('required')
    if (!namaKegiatan) errs.namaKegiatan = c('required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const kunjunganRes = await fetch('/api/kunjungan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis_kegiatan: jenisKegiatan,
          tanggal,
          jam,
          jalan,
          kelurahan: kelurahanMap[kelurahanId],
          kecamatan: kecamatanMap[kecamatanId],
          kota: kotaMap[kotaId],
          link_gmaps: linkGmaps,
        }),
      })
      const kunjungan = await kunjunganRes.json()

      await fetch('/api/kegiatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kunjungan_id: kunjungan.id,
          jenis_kegiatan: jenisKegiatan,
          nama_kegiatan: namaKegiatan,
          isi,
          tempat,
          rt,
          rw,
          tanggal,
          jumlah_peserta: jumlahPeserta,
          catatan,
          link_gmaps: linkGmaps,
        }),
      })

      router.push('/admin/kunjungan')
    } catch {
      alert('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select id="jenis_kegiatan" label="Jenis Kegiatan" placeholder="Pilih jenis kegiatan" options={JENIS_KEGIATAN_OPTIONS} value={jenisKegiatan} onChange={(e) => setJenisKegiatan(e.target.value)} error={errors.jenisKegiatan} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="tanggal" label={t('tanggal')} type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} error={errors.tanggal} />
        <Input id="jam" label={t('jam')} type="time" value={jam} onChange={(e) => setJam(e.target.value)} error={errors.jam} />
      </div>

      <Input id="jalan" label={t('jalan')} placeholder="Masukkan nama jalan" value={jalan} onChange={(e) => setJalan(e.target.value)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select id="kota" label={t('kota')} placeholder="Pilih kota" options={kotaOptions} value={kotaId} onChange={(e) => { setKotaId(e.target.value); setKecamatanId(''); setKelurahanId('') }} error={errors.kota} />
        <Select id="kecamatan" label={t('kecamatan')} placeholder={kotaId ? 'Pilih kecamatan' : 'Pilih kota terlebih dahulu'} options={kecamatanOptions} value={kecamatanId} onChange={(e) => { setKecamatanId(e.target.value); setKelurahanId('') }} error={errors.kecamatan} disabled={!kotaId} />
        <Select id="kelurahan" label={t('kelurahan')} placeholder={kecamatanId ? 'Pilih kelurahan' : 'Pilih kecamatan terlebih dahulu'} options={kelurahanOptions} value={kelurahanId} onChange={(e) => setKelurahanId(e.target.value)} error={errors.kelurahan} disabled={!kecamatanId} />
      </div>

      <Input id="nama_kegiatan" label="Nama Kegiatan" placeholder="Masukkan nama kegiatan" value={namaKegiatan} onChange={(e) => setNamaKegiatan(e.target.value)} error={errors.namaKegiatan} required />

      <Input id="isi" label="Isi/Keterangan" placeholder="Deskripsi kegiatan" value={isi} onChange={(e) => setIsi(e.target.value)} />

      <Input id="tempat" label="Tempat" placeholder="Lokasi kegiatan" value={tempat} onChange={(e) => setTempat(e.target.value)} />

      <Input id="link_gmaps" label="Titik Lokasi (Google Maps)" placeholder="https://maps.google.com/?q=..." value={linkGmaps} onChange={(e) => setLinkGmaps(e.target.value)} />

      <div className="grid grid-cols-2 gap-4">
        <Input id="rt" label="RT" placeholder="001" value={rt} onChange={(e) => setRt(e.target.value)} />
        <Input id="rw" label="RW" placeholder="005" value={rw} onChange={(e) => setRw(e.target.value)} />
        <Input id="jumlah_peserta" label="Jumlah Peserta" type="number" placeholder="0" value={jumlahPeserta} onChange={(e) => setJumlahPeserta(e.target.value)} />
      </div>

      <div>
        <label htmlFor="catatan" className="block text-sm font-medium text-[var(--color-text)] mb-1">Catatan</label>
        <textarea id="catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={3}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          placeholder="Catatan tambahan..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {c('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? c('loading') : c('save')}
        </Button>
      </div>
    </form>
  )
}
