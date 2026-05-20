'use client'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Link } from '@/routing'
import {
  MdSend,
  MdCheckCircle,
  MdArrowBack,
} from 'react-icons/md'

export default function PengajuanAspirasiPage(): React.ReactNode {
  const [nama, setNama] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telepon, setTelepon] = useState('')
  const [pengaduan, setPengaduan] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/aspirasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sumber: 'CALL_CENTER',
        deskripsi: pengaduan,
        pelapor_nama: nama,
        pelapor_email: '',
        pelapor_telepon: telepon,
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
            <Link href="/dashboard/tiket-saya">
              <Button>Cek Tiket Saya</Button>
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

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="nama"
            label="Nama Pengadu"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
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
          <Button type="submit" className="w-full" disabled={loading}>
            <MdSend size={18} className="mr-1" />
            {loading ? 'Mengirim...' : 'Kirim Aspirasi'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
