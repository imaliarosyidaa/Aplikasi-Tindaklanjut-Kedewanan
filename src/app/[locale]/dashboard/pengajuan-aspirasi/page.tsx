'use client'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { Card } from '@/components/ui/card'
import { Link } from '@/routing'
import {
  MdSend,
  MdCheckCircle,
  MdArrowBack,
} from 'react-icons/md'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'

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

interface UploadedFile {
  name: string
  size: number
  type: string
  base64: string
}

export default function PengajuanAspirasiPage(): React.ReactNode {
  const t = useTranslations('Kunjungan')
  const [nik, setNik] = useState('')
  const [nama, setNama] = useState('')
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telepon, setTelepon] = useState('')
  const [pengaduan, setPengaduan] = useState('')
  const [lampiran, setLampiran] = useState<UploadedFile[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const kota = kotaMap[kotaId] ?? ''
    const kecamatan = kecamatanMap[kecamatanId] ?? ''
    const kelurahan = kelurahanMap[kelurahanId] ?? ''

    await fetch('/api/aspirasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nik,
        sumber: 'CALL_CENTER',
        deskripsi: pengaduan,
        pelapor_nama: nama,
        pelapor_email: '',
        pelapor_telepon: telepon,
        kota,
        kecamatan,
        kelurahan,
        lokasi: alamat,
        lampiran: lampiran.map(f => ({ name: f.name, size: f.size, type: f.type, base64: f.base64 })),
      }),
    })
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md p-8 text-center">
          <MdCheckCircle size={48} className="mx-auto text-[var(--color-success)] mb-4" />
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Aspirasi Terkirim
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-4">
            Terima kasih, aspirasi Anda sudah kami terima.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Ajukan Lagi
            </Button>
            <Link href="/dashboard/laporan-saya">
              <Button>Cek Laporan Saya</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
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
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        <MdArrowBack size={16} />
        Kembali ke Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Pengajuan Aspirasi
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Sampaikan aspirasi Anda
        </p>
      </div>

      <Card className="p-6 w-full mx-auto bg-blue-50 border-blue-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="nik"
            label="Nomor Induk Kependudukan (NIK)"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
          />
          <p className="text-sm text-[var(--color-text-secondary)] -mt-2">*Boleh Dikosongkan</p>
          <Input
            id="nama"
            label="Nama Pelapor"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
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
            id="alamat"
            label="Alamat"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            required
          />
          <Input
            id="telepon"
            label="No. Telepon"
            type="tel"
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            required
          />
          <div>
            <label
              htmlFor="pengaduan"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Isi Pengaduan
            </label>
            <textarea
              id="pengaduan"
              value={pengaduan}
              onChange={(e) => setPengaduan(e.target.value)}
              required
              rows={5}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              placeholder="Tuliskan aspirasi Anda..."
            />
          </div>
          <FileUpload
            label="Upload Lampiran"
            value={lampiran}
            onChange={setLampiran}
          />
          <p className="text-sm text-[var(--color-text-secondary)] -mt-2">*Boleh Dikosongkan</p>
          <Button type="submit" className="w-full" disabled={loading}>
            <MdSend size={18} className="mr-1" />
            {loading ? 'Mengirim...' : 'Kirim Aspirasi'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
