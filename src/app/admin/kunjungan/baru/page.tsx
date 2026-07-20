'use client'
import React, { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from '@/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { MdArrowBack, MdArrowForward, MdCheck, MdCheckCircle, MdCheckCircleOutline, MdHome, MdInfo, MdLocationCity, MdLocationPin } from 'react-icons/md'
import { Home, Handshake, Megaphone, ClipboardList } from 'lucide-react'
import Card from '@mui/material/Card'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'

const fetcher = (url: string) => fetch(url).then((r) => r.json())
interface KotaItem { id: string; nama: string }
interface KecamatanItem { id: string; nama: string }
interface KelurahanItem { id: string; nama: string }
interface UploadedFile { name: string; size: number; type: string; base64: string }

const activities = [
  { id: 'RESES', title: 'Reses', desc: 'Serap aspirasi masyarakat', icon: Home },
  { id: 'SOSPERDA', title: 'Sosperda', desc: 'Fungsi pengawasan produk hukum daerah DKI Jakarta', icon: Handshake },
  { id: 'PELATIHAN_MASYARAKAT', title: 'Pelatihan Masyarakat', desc: 'Pemberdayaan dan peningkatan keterampilan warga', icon: Megaphone },
  { id: 'RAPAT_KERJA', title: 'Rapat Kerja', desc: 'Koordinasi program kerja bersama mitra eksekutif', icon: ClipboardList },
  { id: 'RAPAT_KOMISI', title: 'Rapat Komisi', desc: 'Pembahasan kebijakan dan pengawasan bidang spesifik', icon: ClipboardList },
  { id: 'LAINYA', title: 'Lainnya', desc: 'Agenda kedewanan di luar kategori utama', icon: ClipboardList },
]

const stepLabels = ['Jenis Kegiatan', 'Lokasi', 'Detail', 'Upload']

export default function KegiatanBaruPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [jenisKegiatan, setJenisKegiatan] = useState('')
  const [jenisLainnya, setJenisLainnya] = useState('')

  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [jalan, setJalan] = useState('')
  const [rt, setRt] = useState('')
  const [rw, setRw] = useState('')

  const [namaKegiatan, setNamaKegiatan] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [jam, setJam] = useState('')
  const [tempat, setTempat] = useState('')
  const [jumlahPeserta, setJumlahPeserta] = useState('')
  const [catatan, setCatatan] = useState('')
  const [linkGmaps, setLinkGmaps] = useState('')

  const [fotoFiles, setFotoFiles] = useState<UploadedFile[]>([])

  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(kotaId ? `/api/kecamatan?kota=${kotaId}` : null, fetcher)
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : null, fetcher)

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))
  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))
  const kotaMap = Object.fromEntries(kotaList.map((k) => [k.id, k.nama]))
  const kecamatanMap = Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama]))
  const kelurahanMap = Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama]))

  const canNext = () => {
    if (step === 0) return jenisKegiatan !== ''
    if (step === 1) return kotaId !== '' && kecamatanId !== '' && kelurahanId !== ''
    if (step === 2) return namaKegiatan.trim() !== '' && tanggal !== ''
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const body = {
        jenis_kegiatan: jenisKegiatan === 'LAINYA' ? jenisLainnya : jenisKegiatan,
        nama_kegiatan: namaKegiatan,
        tanggal,
        jam,
        jumlah_peserta: parseInt(jumlahPeserta) || 0,
        catatan,
        isi: namaKegiatan,
        link_gmaps: linkGmaps,
        foto: fotoFiles[0]?.base64 ?? '',
        jalan,
        rt,
        rw,
        alamat: `${jalan} RT ${rt} RW ${rw}`.trim(),
        kota: kotaMap[kotaId],
        kecamatan: kecamatanMap[kecamatanId],
        kelurahan: kelurahanMap[kelurahanId],
      }
      const res = await fetch('/api/kunjungan/with-kegiatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        router.push('/admin/kunjungan')
      } else {
        alert('Gagal menyimpan kegiatan')
      }
    } catch {
      alert('Gagal menyimpan kegiatan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tambah Kegiatan</h1>
          <p className="text-slate-500">Langkah {step + 1} dari {stepLabels.length}</p>
        </div>
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <MdArrowBack size={18} className="mr-1" /> Sebelumnya
            </Button>
          )}
          {step < stepLabels.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
              Selanjutnya <MdArrowForward size={18} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {stepLabels.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${i <= step ? 'bg-blue-600' : 'bg-slate-300'}`}>
                {i + 1}
              </div>
              <div className="text-start">
                <div className={`font-medium ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>{label}</div>
                <div className="text-sm text-slate-400">{['Pilih jenis kegiatan', 'Pilih lokasi kegiatan', 'Informasi kegiatan', 'Dokumentasi kegiatan'][i]}</div>
              </div>
            </div>
            {i < stepLabels.length - 1 && <div className={`flex-1 h-1 mx-4 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Jenis Kegiatan */}
      {step === 0 && (
        <div>
          <h2 className="text-xl font-semibold">Pilih Jenis Kegiatan</h2>
          <p className="mb-6 text-slate-500">Pilih jenis kegiatan yang ingin Anda tambahkan.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {activities.map((item) => {
              const Icon = item.icon
              const active = jenisKegiatan === item.id
              return (
                <button key={item.id} onClick={() => setJenisKegiatan(item.id)}
                  className={`cursor-pointer text-center flex h-48 flex-col justify-center items-center rounded-2xl border p-6 transition duration-300 hover:bg-blue-50 hover:-translate-y-1 ${active ? 'border-blue-600 border-2' : 'border-slate-200 bg-white'}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon size={30} />
                  </div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-slate-500 mt-2 text-sm">{item.desc}</p>
                </button>
              )
            })}
          </div>
          {jenisKegiatan === 'LAINYA' && (
            <div className="mt-4">
              <Input id="jenis-lainnya" label="Jenis Kegiatan Lainnya" value={jenisLainnya} onChange={(e) => setJenisLainnya(e.target.value)} placeholder="Masukkan jenis kegiatan" />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Lokasi */}
      {step === 1 && (
        <div className='bg-white min-h-screen p-12 rounded-md grid lg:grid-cols-3 grid-cols-2 gap-16'>
          <div className='col-span-2 mt-[-12px]'>
            <h2 className="text-xl font-semibold">Lokasi Kegiatan</h2>
            <p className="mb-6 text-slate-500">Tentukan lokasi kegiatan yang dilakukan</p>

            <div className="space-y-4">
              <div className="min-w-[180px] mb-4">
                <label className='font-medium text-sm'>Kota/Kabupaten <span className='text-red-500'>*</span></label>
                <div className="flex items-center gap-3 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 focus-within:border-[var(--color-primary)] transition-all">

                  <MdLocationCity
                    size={20}
                    className="text-[var(--color-text-secondary)] flex-shrink-0"
                  />
                  <div
                    className="w-full"
                  >
                    <Select
                      id="kota"
                      placeholder="Pilih Kota"
                      options={kotaOptions}
                      value={kotaId}
                      onChange={(e) => {
                        setKotaId(e.target.value);
                        setKecamatanId('');
                        setKelurahanId('');
                      }}
                      className='bg-transparent border-none px-0 py-2.5 text-[var(--color-text)] focus:ring-0 outline-none cursor-pointer'
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-[180px] mb-4">
                <label className='font-medium text-sm'>Kota/Kabupaten <span className='text-red-500'>*</span></label>
                <div className="flex items-center gap-3 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 focus-within:border-[var(--color-primary)] transition-all">

                  <MdLocationPin
                    size={20}
                    className="text-[var(--color-text-secondary)] flex-shrink-0"
                  />
                  <div
                    className="w-full"
                  >
                    <Select
                      id="kecamatan"
                      placeholder="Pilih Kecamatan"
                      options={kecamatanOptions}
                      value={kecamatanId}
                      onChange={(e) => {
                        setKecamatanId(e.target.value);
                        setKelurahanId('');
                      }}
                      disabled={!kotaId}
                      className='bg-transparent border-none px-0 py-2.5 text-[var(--color-text)] focus:ring-0 outline-none cursor-pointer'
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-[180px] mb-4">
                <label className='font-medium text-sm'>Kelurahan <span className='text-red-500'>*</span></label>
                <div className="flex items-center gap-3 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 focus-within:border-[var(--color-primary)] transition-all">

                  <MdHome
                    size={20}
                    className="text-[var(--color-text-secondary)] flex-shrink-0"
                  />
                  <div
                    className="w-full"
                  >
                    <Select
                      id="kelurahan"
                      placeholder="Pilih Kelurahan"
                      options={kelurahanOptions}
                      value={kelurahanId}
                      onChange={(e) => {
                        setKelurahanId(e.target.value);
                      }}
                      disabled={!kecamatanId}
                      className='bg-transparent border-none px-0 py-2.5 text-[var(--color-text)] focus:ring-0 outline-none cursor-pointer'
                    />
                  </div>
                </div>
              </div>

              <label className='font-medium text-sm'>Jalan/Lokasi Detail <span className='text-red-500'>*</span></label>
              <Input id="jalan" value={jalan} onChange={(e) => setJalan(e.target.value)} placeholder="Masukkan nama jalan" />

              <div className="grid grid-cols-2 gap-3">
                <Input id="rt" label="RT" type='number' value={rt} onChange={(e) => setRt(e.target.value)} placeholder="RT" />
                <Input id="rw" label="RW" type='number' value={rw} onChange={(e) => setRw(e.target.value)} placeholder="RW" />
              </div>
            </div>
          </div>

          <div className='p-4 space-y-4 col-span-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]'>
            <div className='flex items-center gap-2'>
              <MdInfo
                size={20}
                className="text-blue-500 flex-shrink-0"
              />
              <h2 className='font-medium text-black text-sm'>Contoh Pengisian</h2>
            </div>
            <div className='text-xs text-[var(--color-text-secondary)]'>
              <div className='flex gap-2 mb-2'>
                <IoMdCheckmarkCircleOutline
                  size={15}
                  className="text-green-500 flex-shrink-0"
                />
                <p>Pilih lokasi sampai tingkat kelurahan agar data akurat</p>
              </div>
              <div className='flex gap-2 mb-2'>
                <IoMdCheckmarkCircleOutline
                  size={15}
                  className="text-green-500 flex-shrink-0"
                />
                <p>Pastikan alamat sesuai dengan lokasi kegiatan</p>
              </div>
              <div className='flex gap-2 mb-2'>
                <IoMdCheckmarkCircleOutline
                  size={15}
                  className="text-green-500 flex-shrink-0"
                />
                <p>Gunakan peta jika lokasi tidak ditemukan</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Detail */}
      {step === 2 && (
        <div className='bg-white min-h-screen p-12 rounded-md grid lg:grid-cols-3 grid-cols-2 gap-16'>
          <div className='col-span-2 mt-[-12px]'>
            <h2 className="text-xl font-semibold">Informasi Kegiatan</h2>
            <p className="mb-6 text-slate-500">Lengkapi detail kegiatan.</p>

            <div className="space-y-4 max-w-xl">

              <label className='font-medium text-sm'>Nama Kegiatan <span className='text-red-500'>*</span></label>
              <Input id="nama_kegiatan" value={namaKegiatan} onChange={(e) => setNamaKegiatan(e.target.value)} placeholder="Masukkan nama kegiatan" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className='font-medium text-sm'>Tanggal <span className='text-red-500'>*</span></label>
                  <Input id="tanggal" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                </div>
                <div>
                  <label className='font-medium text-sm'>Jam<span className='text-red-500'>*</span></label>
                  <Input id="jam" type="time" value={jam} onChange={(e) => setJam(e.target.value)} />
                </div>
              </div>

              <label className='font-medium text-sm'>Tempat Kegiatan <span className='text-red-500'>*</span></label>
              <Input id="tempat_kegiatan" value={tempat} onChange={(e) => setTempat(e.target.value)} placeholder="Masukkan tempat kegiatan" />

              <div className="w-full">
                <label htmlFor="jumlah_peserta" className="block font-medium text-sm mb-1.5 text-[var(--color-text)]">
                  Jumlah Peserta <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center w-full max-w-[180px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden focus-within:border-[var(--color-primary)] transition-all">

                  <button
                    type="button"
                    onClick={() => setJumlahPeserta(Math.max(0, (Number(jumlahPeserta) || 0) - 1))}
                    className="px-3 py-2.5 text-gray-500 hover:text-[var(--color-primary)] bg-[var(--color-bg-secondary)]/30 hover:bg-[var(--color-bg-secondary)]/80 transition-all cursor-pointer border-r border-[var(--color-border)] font-semibold text-lg"
                  >
                    -
                  </button>

                  <input
                    id="jumlah_peserta"
                    type="number"
                    min="0"
                    value={jumlahPeserta}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) {
                        setJumlahPeserta(val);
                      }
                    }}
                    placeholder="0"
                    className="w-full text-center bg-transparent border-none py-2 text-sm text-[var(--color-text)] focus:ring-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-medium"
                  />

                  <button
                    type="button"
                    onClick={() => setJumlahPeserta((Number(jumlahPeserta) || 0) + 1)}
                    className="px-3 py-2.5 text-gray-500 hover:text-[var(--color-primary)] bg-[var(--color-bg-secondary)]/30 hover:bg-[var(--color-bg-secondary)]/80 transition-all cursor-pointer border-l border-[var(--color-border)] font-semibold text-lg"
                  >
                    +
                  </button>

                </div>
              </div>

              <div>
                <label htmlFor="catatan" className="block text-sm font-medium text-[var(--color-text)] mb-1">Catatan</label>
                <textarea id="catatan" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Catatan kegiatan" />
              </div>
              <Input id="link_gmaps" label="Link Google Maps" value={linkGmaps} onChange={(e) => setLinkGmaps(e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </div>
          <div className="p-4 space-y-4 col-span-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] divide-y divide-[var(--color-border)]">
            <div>
              <div className="flex gap-2 mb-6">
                <MdInfo
                  size={20}
                  className="text-blue-500 flex-shrink-0"
                />
                <div>
                  <h2 className="mb-2 font-medium text-black">Informasi</h2>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    Pastikan informasi kegiatan diisi dengan benar agar memudahkan proses pelaporan dan analisis data.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex mb-2 items-center gap-2">
                <MdInfo
                  size={20}
                  className="text-blue-500 flex-shrink-0"
                />
                <h2 className="font-medium text-black text-sm">Contoh Pengisian</h2>
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                <div className="flex gap-2 mb-2">
                  <IoMdCheckmarkCircleOutline
                    size={15}
                    className="text-green-500 flex-shrink-0"
                  />
                  <p>Tanggal dan jam sesuai pelaksanaan kegiatan</p>
                </div>
                <div className="flex gap-2 mb-2">
                  <IoMdCheckmarkCircleOutline
                    size={15}
                    className="text-green-500 flex-shrink-0"
                  />
                  <p>Jumlah peserta adalah total peserta yang hadir</p>
                </div>
                <div className="flex gap-2 mb-2">
                  <IoMdCheckmarkCircleOutline
                    size={15}
                    className="text-green-500 flex-shrink-0"
                  />
                  <p>Catatan berisi rangkuman singkat kegiatan (opsional)</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Step 4: Upload */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold">Dokumentasi Kegiatan</h2>
          <p className="mb-6 text-slate-500">Upload dokumentasi kegiatan (opsional).</p>
          <div className="max-w-xl">
            <FileUpload label="Upload Foto" value={fotoFiles} onChange={setFotoFiles} />
          </div>
        </div>
      )}
    </div>
  )
}
