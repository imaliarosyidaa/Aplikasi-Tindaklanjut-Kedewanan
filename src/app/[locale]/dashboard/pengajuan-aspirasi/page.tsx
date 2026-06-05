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
import { getKecamatanOptions, getKelurahanByKecamatanId } from '@/utils/masterWilayah'

interface UploadedFile {
  name: string
  size: number
  type: string
  base64: string
}

export default function PengajuanAspirasiPage(): React.ReactNode {
  const [nik, setNik] = useState('')
  const [nama, setNama] = useState('')
  const [kota] = useState('Jakarta Selatan')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telepon, setTelepon] = useState('')
  const [pengaduan, setPengaduan] = useState('')
  const [lampiran, setLampiran] = useState<UploadedFile[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const kecamatanOptions = getKecamatanOptions()
  const kelurahanOptions = kecamatanId ? getKelurahanByKecamatanId(kecamatanId) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const kecamatan = kecamatanOptions.find(k => k.value === kecamatanId)?.label ?? ''
    const kelurahan = kelurahanOptions.find(k => k.value === kelurahanId)?.label ?? ''

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

      <Card className="p-6 max-w-2xl mx-auto bg-blue-50 border-blue-200">
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
          <Input
            id="kota"
            label="Kota"
            value={kota}
            disabled
          />
          <Select
            id="kecamatan"
            label="Kecamatan"
            placeholder="Pilih Kecamatan"
            options={kecamatanOptions}
            value={kecamatanId}
            onChange={(e) => {
              setKecamatanId(e.target.value)
              setKelurahanId('')
            }}
            required
          />
          {kecamatanId && (
            <Select
              id="kelurahan"
              label="Kelurahan"
              placeholder="Pilih Kelurahan"
              options={kelurahanOptions}
              value={kelurahanId}
              onChange={(e) => setKelurahanId(e.target.value)}
              required
            />
          )}
          <Input
            id="alamat"
            label="Keterangan Tempat"
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
