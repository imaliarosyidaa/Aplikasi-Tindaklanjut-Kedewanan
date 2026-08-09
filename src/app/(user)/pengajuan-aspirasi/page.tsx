'use client'
import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { Card } from '@/components/ui/card'
import { Link } from '@/routing'
import {
  MdSend,
  MdPrint,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdDescription,
  MdSource,
  MdError,
  MdEmail,
  MdCheck,
  MdContentCopy,
} from 'react-icons/md'
import useSWR from 'swr'
import type { LucideIcon } from 'lucide-react'
import { ClipboardList, Handshake, Home, Megaphone, PhoneCall, TextCursor } from 'lucide-react'
import { MasterKecamatan, MasterKelurahan, MasterKota } from '../../../types/index'
import { SearchableSelect } from '@/components/ui/searchable-select'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SUMBER_ASPIRASI: { id: string; title: string; desc?: string; icon?: LucideIcon }[] = [
  { id: 'LEMBAR_ASPIRASI_RESES', title: 'Lembar Aspirasi Reses', icon: Home },
  { id: 'LEMBAR_ASPIRASI_SOSPERDA', title: 'Lembar Aspirasi Sosperda', icon: Handshake },
  { id: 'ASPIRASI_PROPOSAL_LANGSUNG', title: 'Aspirasi Proposal Langsung', icon: Megaphone },
  { id: 'KOORDINASI_DINAS_TERKAIT', title: 'Koordinasi Dinas Terkait', icon: PhoneCall },
  { id: 'USULAN_MUSRENBANG_DEWAN', title: 'Usulan Musrenbang Dewan', icon: TextCursor },
  { id: 'CALL_CENTER', title: 'Call Center', icon: PhoneCall },
  { id: 'LAINYA', title: 'Lainnya', desc: 'Jenis kegiatan di kategori utama', icon: ClipboardList },
]

function TicketLaporan({
  data,
  onReset,
}: {
  data: {
    idLaporan: string
    nik: string
    nama: string
    email: string
    kota: string
    kecamatan: string
    kelurahan: string
    alamat: string
    telepon: string
    pengaduan: string
    lampiran: string[]
    tanggal: string
  }
  onReset: () => void
}) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!data?.idLaporan) return
    navigator.clipboard.writeText(data.idLaporan)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <tr><td class="label">Email</td><td class="value">${data.email || '-'}</td></tr>
          <tr><td class="label">No. Telepon</td><td class="value">${data.telepon}</td></tr>
          <tr><td class="label">Kelurahan</td><td class="value">${data.kelurahan}</td></tr>
          <tr><td class="label">Kecamatan</td><td class="value">${data.kecamatan}</td></tr>
          <tr><td class="label">Kota</td><td class="value">${data.kota}</td></tr>
          <tr><td class="label">Alamat</td><td class="value">${data.alamat}</td></tr>
          <tr><td class="label">Tanggal Dibuat</td><td class="value">${data.tanggal}</td></tr>
          <tr><td class="label">Isi Pengaduan</td><td class="value">${data.pengaduan}</td></tr>
          ${data.lampiran.length > 0 ? `<tr><td class="label">Lampiran</td><td class="value">${data.lampiran.map((f) => (f.startsWith('data:application/pdf') ? `<span style="display:inline-block;padding:4px 12px;font-size:11px;color:#666;background:#f3f4f6;border:1px solid #d1d5db;border-radius:4px;margin:2px;">PDF</span>` : `<img src="${f}" class="lampiran-img" />`)).join('')}</td></tr>` : ''}
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
            <div className="w-fit mt-2 inline-flex items-center gap-1.5 ">
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1">
                <p className="text-2xl font-bold font-mono tracking-wider text-[var(--color-text)]">{data.idLaporan}</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Salin ID Laporan"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#5cb85c] hover:bg-[#419641] border-2 border-[#419641] text-white transition-all hover:opacity-90 active:scale-95"
                >
                  {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
                </button>
                {copied ? (
                  <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-xs font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-900 animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <MdCheck className="text-green-400 dark:text-green-600" size={18} />
                    <span>ID Laporan berhasil disalin ke papan klip</span>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
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
              <MdEmail size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Email</span>
              <span className="text-[var(--color-text)]">{data.email}</span>
            </div>
            <div className="flex gap-2">
              <MdPhone size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">No. Telepon</span>
              <span className="text-[var(--color-text)]">{data.telepon}</span>
            </div>
            <div className="flex gap-2">
              <MdLocationOn size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Kelurahan</span>
              <span className="text-[var(--color-text)]">{data.kelurahan}</span>
            </div>
            <div className="flex gap-2">
              <MdLocationOn size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Kecamatan</span>
              <span className="text-[var(--color-text)]">{data.kecamatan}</span>
            </div>
            <div className="flex gap-2">
              <MdLocationOn size={16} className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
              <span className="w-28 text-[var(--color-text-secondary)]">Kota</span>
              <span className="text-[var(--color-text)]">{data.kota}</span>
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
                  {data.lampiran.map((f, i) =>
                    f.startsWith('data:application/pdf') ? (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          fetch(f)
                            .then((r) => r.blob())
                            .then((blob) => {
                              window.open(URL.createObjectURL(blob), '_blank')
                            })
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <MdDescription size={14} />
                        Detail
                      </button>
                    ) : (
                      <img
                        key={i}
                        src={f}
                        alt="Lampiran"
                        className="w-20 h-20 object-cover rounded border border-[var(--color-border)]"
                      />
                    ),
                  )}
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
            <Link href="/laporan-saya" className="flex-1">
              <Button variant="outline" className="w-full">
                Cek Laporan Saya
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  )
}

export default function PengajuanAspirasiPage(): React.ReactNode {
  const [idLaporan] = useState(
    () =>
      'LAP-' +
      Array.from({ length: 10 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join(''),
  )
  const [nik, setNik] = useState('')
  const [nama, setNama] = useState('')
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telepon, setTelepon] = useState('')
  const [sumber, setSumber] = useState('')
  const [sumberLainya, setSumberLainya] = useState('')
  const [pengaduan, setPengaduan] = useState('')
  const [lampiran, setLampiran] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [kategoriUsulan, setKategoriUsulan] = useState('')
  const [jenisUsulan, setJenisUsulan] = useState('')
  const [jenisReses, setJenisReses] = useState('')
  const [ticketData, setTicketData] = useState<{
    idLaporan: string
    nik: string
    nama: string
    email: string
    kota: string
    kecamatan: string
    kelurahan: string
    alamat: string
    telepon: string
    pengaduan: string
    lampiran: string[]
    tanggal: string
  } | null>(null)

  const { data: kotaList = [] } = useSWR<MasterKota[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<MasterKecamatan[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : null,
    fetcher,
  )
  const { data: kelurahanList = [] } = useSWR<MasterKelurahan[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : null,
    fetcher,
  )
  const [email, setEmail] = useState('')
  const kotaMap = Object.fromEntries(kotaList.map((k) => [k.id, k.nama]))
  const kecamatanMap = Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama]))
  const kelurahanMap = Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama]))

  // Referensi map wilayah agar tidak perlu dependency di efek auto-apply
  const kotaMapRef = useRef(kotaMap)
  const kecamatanMapRef = useRef(kecamatanMap)
  const kelurahanMapRef = useRef(kelurahanMap)

  useEffect(() => {
    kotaMapRef.current = kotaMap
    kecamatanMapRef.current = kecamatanMap
    kelurahanMapRef.current = kelurahanMap
  }, [kotaMap, kecamatanMap, kelurahanMap])

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKotaId(e.target.value)
    setKecamatanId('')
    setKelurahanId('')
  }
  const handleKecamatanChange = (value: string) => {
    setKecamatanId(value)
    setKelurahanId('')
  }
  const handleKelurahanChange = (value: string) => {
    setKelurahanId(value)
  }
  const [rt, setRt] = useState('')
  const [rw, setRw] = useState('')

  const kotaOptions = [...kotaList]
    .sort((a, b) => {
      if (a.nama === 'Jakarta Selatan') return -1
      if (b.nama === 'Jakarta Selatan') return 1
      return a.nama.localeCompare(b.nama)
    })
    .map((k) => ({ value: k.id, label: k.nama }))

  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))

  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!sumber) {
      setError('Silakan pilih sumber aspirasi terlebih dahulu')
      return
    }
    if (!nama.trim()) {
      setError('Nama pelapor harus diisi')
      return
    }
    if (!telepon.trim()) {
      setError('No. telepon harus diisi')
      return
    }
    if (!kotaId || !kecamatanId || !kelurahanId) {
      setError('Lokasi (Kota, Kecamatan, Kelurahan) harus dipilih')
      return
    }
    if (!pengaduan.trim() || !lampiran) {
      setError('Salah satu isi antara pengaduan atau lampiran aspirasi harus diisi')
      return
    }

    setLoading(true)

    try {
      const kota = kotaMap[kotaId] ?? ''
      const kecamatan = kecamatanMap[kecamatanId] ?? ''
      const kelurahan = kelurahanMap[kelurahanId] ?? ''

      const res = await fetch('/api/aspirasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_laporan: idLaporan,
          nik,
          sumber: sumber === 'LAINYA' ? sumberLainya : sumber,
          deskripsi: pengaduan,
          pelapor_nama: nama,
          pelapor_email: email,
          pelapor_telepon: telepon,
          kategori_usulan: kategoriUsulan,
          jenis_usulan: jenisUsulan,
          jenis_reses: jenisReses,
          kota,
          kecamatan,
          rt: rt,
          rw: rw,
          kelurahan,
          lokasi: alamat,
          lampiran: lampiran,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || 'Gagal mengirim aspirasi. Silakan coba lagi.')
      }

      setTicketData({
        idLaporan,
        nik,
        nama,
        email,
        kota,
        kecamatan,
        kelurahan,
        alamat,
        telepon,
        pengaduan,
        lampiran,
        tanggal: new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted && ticketData) {
    return (
      <TicketLaporan
        data={ticketData}
        onReset={() => {
          setSubmitted(false)
          setTicketData(null)
          setError('')
        }}
      />
    )
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Pengajuan Aspirasi</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Lengkapi formulir berikut untuk menyampaikan aspirasi Anda
        </p>
      </div>

      <Input id="id_laporan" label="ID Laporan" value={idLaporan} disabled className="bg-gray-100 text-gray-500" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MdSource size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Sumber Aspirasi</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {SUMBER_ASPIRASI.map((item) => {
              const Icon = item.icon as LucideIcon
              const active = sumber === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSumber(item.id)}
                  className={`cursor-pointer text-center flex h-40 flex-col justify-center items-center rounded-xl border-2 p-4 transition-all duration-200 ${
                    active
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                      active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon size={26} />
                  </div>
                  <h3 className={`text-sm font-semibold ${active ? 'text-blue-700' : 'text-[var(--color-text)]'}`}>
                    {item.title}
                  </h3>
                </button>
              )
            })}
            {sumber === 'LAINYA' && (
              <div className="mt-4">
                <Input
                  id="jenis-lainnya"
                  label="Sumber Aspirasi Lainnya"
                  value={sumberLainya}
                  onChange={(e) => setSumberLainya(e.target.value)}
                  placeholder="Masukkan sumber kegiatan"
                />
              </div>
            )}
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div>
              <Input
                id="kategori-usulan"
                label="Kategori Usulan"
                value={kategoriUsulan}
                onChange={(e) => setKategoriUsulan(e.target.value)}
                placeholder="Pembangunan / Pendidikan / Kesehatan / Kesejahteraan Sosial  / Dll"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">*Boleh dikosongkan</p>
            </div>
            <div>
              <Input
                id="jenis-usulan"
                label="Jenis Usulan"
                value={jenisUsulan}
                onChange={(e) => setJenisUsulan(e.target.value)}
                placeholder="Pembuatan Drainase / KJP-KJMU / BPJS / Desil / Dll"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">*Boleh dikosongkan</p>
            </div>
            <div>
              <Input
                id="jenis-reses"
                label="Jenis Reses"
                value={jenisReses}
                onChange={(e) => setJenisReses(e.target.value)}
                placeholder="Reses I / Reses II / Reses III"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">*Boleh dikosongkan</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MdPerson size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Data Pelapor Aspirasi</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              id="nama"
              label="Nama Lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              placeholder="Masukkan nama lengkap"
            />
            <div>
              <Input
                id="nik"
                label="NIK (Opsional)"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Masukkan NIK (opsional)"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">*Boleh dikosongkan</p>
            </div>
            <Input
              id="telepon"
              label="Nomor Handphone / Whatsapp Aktif"
              type="tel"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              required
              placeholder="08xxxxxxxxxx"
              className="md:col-span-2"
            />
            <div>
              <Input
                id="email"
                label="Email Aktif (Opsional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="***@gmail.com"
                className="md:col-span-2"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">*Boleh dikosongkan</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MdLocationOn size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Titik Lokasi Pengajuan Kegiatan Aspirasi</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              id="kota"
              label="Kota/Kabupaten"
              placeholder="Pilih kota/kabupaten"
              options={kotaOptions}
              value={kotaId}
              onChange={handleKotaChange}
            />
            <SearchableSelect
              id="kecamatan"
              label="Kecamatan"
              placeholder={kotaId ? 'Pilih kecamatan' : 'Pilih kota terlebih dahulu'}
              options={kecamatanOptions}
              value={kecamatanId}
              onChange={handleKecamatanChange}
              disabled={!kotaId}
            />

            <SearchableSelect
              id="kelurahan"
              label="Kelurahan"
              placeholder={kecamatanId ? 'Pilih kelurahan' : 'Pilih kecamatan terlebih dahulu'}
              options={kelurahanOptions}
              value={kelurahanId}
              onChange={handleKelurahanChange}
              disabled={!kecamatanId}
            />
            <Input
              id="alamat"
              label="Alamat"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat lengkap"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="rt"
                label="RT"
                type="number"
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                placeholder="RT"
              />
              <Input
                id="rw"
                label="RW"
                type="number"
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                placeholder="RW"
              />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MdDescription size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Isi Aspirasi Anda</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="pengaduan" className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Isi Pengaduan Aspirasi (Opsional)
              </label>
              <textarea
                id="pengaduan"
                value={pengaduan}
                onChange={(e) => setPengaduan(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-y"
                placeholder="Tuliskan aspirasi Anda secara jelas dan lengkap..."
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">*Boleh dikosongkan</p>
            </div>
            <FileUpload label="Upload Lampiran Aspirasi (Opsional)" value={lampiran} onChange={setLampiran} />
            <p className="text-xs text-[var(--color-text-secondary)]">*Boleh dikosongkan</p>
          </div>
        </Card>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <MdError size={18} className="shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Mengirim...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MdSend size={20} />
              Kirim Pengaduan Aspirasi Anda
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
