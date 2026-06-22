'use client'
import React, { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import {
  MdSend,
  MdCheckCircle,
  MdArrowBack,
  MdPrint,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdDescription,
  MdSource,
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

function TicketLaporan({
  data,
  onReset,
}: {
  data: {
    idLaporan: string
    nik: string
    nama: string
    kota: string
    kecamatan: string
    kelurahan: string
    alamat: string
    telepon: string
    pengaduan: string
    lampiran: UploadedFile[]
    tanggal: string
  }
  onReset: () => void
}) {
  const ticketRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
      <head>
        <title>Laporan ${data.idLaporan}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #dc2626; padding-bottom: 20px; }
          .header h1 { font-size: 20px; color: #dc2626; margin-bottom: 4px; }
          .header p { font-size: 12px; color: #666; }
          .id-laporan { text-align: center; margin: 20px 0; }
          .id-laporan .label { font-size: 11px; color: #888; }
          .id-laporan .value { font-size: 22px; font-weight: bold; font-family: monospace; letter-spacing: 2px; color: #1a1a2e; }
          .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }
          td.label { width: 140px; color: #666; font-weight: 500; }
          td.value { color: #1a1a2e; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #888; }
          .lampiran-img { max-width: 120px; max-height: 120px; margin: 4px; border: 1px solid #e5e7eb; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN ASPIRASI WARGA</h1>
          <p>DPRD Kota Administrasi Jakarta Selatan</p>
        </div>
        <div class="id-laporan">
          <div class="label">ID Laporan</div>
          <div class="value">${data.idLaporan}</div>
          <div class="status-badge">BELUM DITINDAKLANJUTI</div>
        </div>
        <table>
          <tr><td class="label">Nama Pelapor</td><td class="value">${data.nama}</td></tr>
          <tr><td class="label">NIK</td><td class="value">${data.nik || '-'}</td></tr>
          <tr><td class="label">No. Telepon</td><td class="value">${data.telepon}</td></tr>
          <tr><td class="label">Kota</td><td class="value">${data.kota}</td></tr>
          <tr><td class="label">Kecamatan</td><td class="value">${data.kecamatan}</td></tr>
          <tr><td class="label">Kelurahan</td><td class="value">${data.kelurahan}</td></tr>
          <tr><td class="label">Alamat</td><td class="value">${data.alamat}</td></tr>
          <tr><td class="label">Tanggal Dibuat</td><td class="value">${data.tanggal}</td></tr>
          <tr><td class="label">Isi Pengaduan</td><td class="value">${data.pengaduan}</td></tr>
          ${data.lampiran.length > 0 ? `<tr><td class="label">Lampiran</td><td class="value">${data.lampiran.map(f => f.base64.startsWith('data:application/pdf') ? `<span style="display:inline-block;padding:4px 12px;font-size:11px;color:#666;background:#f3f4f6;border:1px solid #d1d5db;border-radius:4px;margin:2px;">PDF — ${f.name}</span>` : `<img src="${f.base64}" class="lampiran-img" alt="${f.name}" />`).join('')}</td></tr>` : ''}
        </table>
        <div class="footer">
          Dokumen ini dicetak pada ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}<br/>
          DPRD Kota Administrasi Jakarta Selatan
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 500)
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #ticket-area, #ticket-area * { visibility: visible; }
          #ticket-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      <div ref={ticketRef} id="ticket-area">
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="text-center mb-6 border-b-2 border-red-600 pb-4">
            <h1 className="text-lg font-bold text-red-600">LAPORAN ASPIRASI WARGA</h1>
            <p className="text-xs text-[var(--color-text-secondary)]">DPRD Kota Administrasi Jakarta Selatan</p>
          </div>

          <div className="text-center mb-6">
            <p className="text-xs text-[var(--color-text-secondary)]">ID Laporan</p>
            <p className="text-2xl font-bold font-mono tracking-wider text-[var(--color-text)]">{data.idLaporan}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <MdPerson size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Nama Pelapor</span>
              <span className="text-[var(--color-text)]">{data.nama}</span>
            </div>
            <div className="flex gap-2">
              <MdPerson size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">NIK</span>
              <span className="text-[var(--color-text)]">{data.nik || '-'}</span>
            </div>
            <div className="flex gap-2">
              <MdPhone size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">No. Telepon</span>
              <span className="text-[var(--color-text)]">{data.telepon}</span>
            </div>
            <div className="flex gap-2">
              <MdLocationOn size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Kota</span>
              <span className="text-[var(--color-text)]">{data.kota}</span>
            </div>
            <div className="flex gap-2">
              <MdLocationOn size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Kecamatan</span>
              <span className="text-[var(--color-text)]">{data.kecamatan}</span>
            </div>
            <div className="flex gap-2">
              <MdLocationOn size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Kelurahan</span>
              <span className="text-[var(--color-text)]">{data.kelurahan}</span>
            </div>
            <div className="flex gap-2">
              <MdLocationOn size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Alamat</span>
              <span className="text-[var(--color-text)]">{data.alamat}</span>
            </div>
            <div className="flex gap-2">
              <MdSource size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Tanggal</span>
              <span className="text-[var(--color-text)]">{data.tanggal}</span>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
              <MdDescription size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Pengaduan</span>
              <span className="text-[var(--color-text)]">{data.pengaduan}</span>
            </div>
            {data.lampiran.length > 0 && (
              <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                <MdDescription size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
                <span className="w-28 text-[var(--color-text-secondary)]">Lampiran</span>
                <div className="flex flex-wrap gap-2">
                  {data.lampiran.map((f, i) => (
                    f.base64.startsWith('data:application/pdf') ? (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          fetch(f.base64).then(r => r.blob()).then(blob => {
                            window.open(URL.createObjectURL(blob), '_blank')
                          })
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <MdDescription size={14} />
                        Detail
                      </button>
                    ) : (
                      <img key={i} src={f.base64} alt={f.name} className="w-20 h-20 object-cover rounded border border-[var(--color-border)]" />
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8 pt-4 border-t border-[var(--color-border)]">
            <Button onClick={handlePrint} className="flex-1">
              <MdPrint size={18} className="mr-1" />
              Cetak / Download PDF
            </Button>
            <Button onClick={onReset} variant="outline" className="flex-1">
              Ajukan Lagi
            </Button>
            <Link href="/dashboard/laporan-saya" className="flex-1">
              <Button variant="outline" className="w-full">Cek Laporan Saya</Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  )
}

export default function PengajuanAspirasiPage(): React.ReactNode {
  const t = useTranslations('Kunjungan')
  const [idLaporan] = useState(() =>
    'LAP-' + Array.from({ length: 10 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('')
  )
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
  const [ticketData, setTicketData] = useState<{
    idLaporan: string
    nik: string
    nama: string
    kota: string
    kecamatan: string
    kelurahan: string
    alamat: string
    telepon: string
    pengaduan: string
    lampiran: UploadedFile[]
    tanggal: string
  } | null>(null)

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
        id_laporan: idLaporan,
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
    setTicketData({
      idLaporan,
      nik,
      nama,
      kota,
      kecamatan,
      kelurahan,
      alamat,
      telepon,
      pengaduan,
      lampiran,
      tanggal: new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    })
    setSubmitted(true)
  }

  if (submitted && ticketData) {
    return <TicketLaporan data={ticketData} onReset={() => { setSubmitted(false); setTicketData(null) }} />
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
            id="id_laporan"
            label="ID Laporan"
            value={idLaporan}
            disabled
            className="bg-gray-100 text-gray-500"
          />
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
