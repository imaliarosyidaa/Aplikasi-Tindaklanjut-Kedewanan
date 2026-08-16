'use client'

import React, { useEffect, useState } from 'react'

import { useDashboardStats } from '@/hooks/useDashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { BarChart } from '@/components/dashboard/BarChart'
import { PieChart } from '@/components/dashboard/PieChart'
import { Modal } from '@/components/ui/modal'
import { useRouter } from '@/routing'
import { MdDirectionsWalk, MdTrackChanges, MdCheckCircle, MdPending, MdChevronRight } from 'react-icons/md'
import { IoMdCloseCircle } from 'react-icons/io'
import type { KecamatanStat } from '@/types'
import { Card } from '@/components/ui/card'
import { TbCalendarWeek } from 'react-icons/tb'
import { BsBinoculars } from 'react-icons/bs'
import { useSession } from 'next-auth/react'

// 1. Master Legenda Status
const LEGENDA_STATUS = [
  { key: 'BELUM_DITINDAKLANJUTI', label: 'Belum Ditindaklanjuti', color: '#EF4444' }, // Merah
  { key: 'SEDANG_DITINDAKLANJUTI', label: 'Sedang Ditindaklanjuti', color: '#F59E0B' }, // Kuning/Amber
  { key: 'SUDAH_DITINDAKLANJUTI', label: 'Sudah Ditindaklanjuti', color: '#10B981' }, // Hijau
  { key: 'TIDAK_BISA_DITINDAKLANJUTI', label: 'Tidak Bisa Ditindaklanjuti', color: '#6B7280' }, // Abu-abu
]

// 2. Master Legenda Sumber & Warna Disatukan
const LEGENDA_SUMBER = [
  { key: 'LEMBAR_ASPIRASI_RESES', label: 'Lembar Aspirasi Reses', color: '#3B82F6' },
  { key: 'LEMBAR_ASPIRASI_SOSPERDA', label: 'Lembar Aspirasi Sosperda', color: '#F97316' },
  { key: 'ASPIRASI_PROPOSAL_LANGSUNG', label: 'Aspirasi Proposal Langsung', color: '#22C55E' },
  { key: 'KOORDINASI_DINAS_TERKAIT', label: 'Koordinasi Dinas Terkait', color: '#A855F7' },
  { key: 'USULAN_MUSRENBANG_DEWAN', label: 'Usulan Musrenbang Dewan', color: '#EF4444' },
  { key: 'CALL_CENTER', label: 'Call Center', color: '#F59E0B' },
]

export const KecamatanList = ({ kecamatanStats }: { kecamatanStats: KecamatanStat[] }) => {
  const router = useRouter()

  const [selectedKecamatan, setSelectedKecamatan] = useState<KecamatanStat | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sort: Prioritaskan yang punya kegiatan/kelurahan dikunjungi > 0
  const sortedStats = [...(kecamatanStats ?? [])].sort((a, b) => {
    const aCount = (a.kelurahan_dikunjungi ?? 0) > 0 || (a.jumlah_kunjungan ?? 0) > 0
    const bCount = (b.kelurahan_dikunjungi ?? 0) > 0 || (b.jumlah_kunjungan ?? 0) > 0
    if (aCount && !bCount) return -1
    if (!aCount && bCount) return 1
    return (b.kelurahan_dikunjungi ?? b.jumlah_kunjungan ?? 0) - (a.kelurahan_dikunjungi ?? a.jumlah_kunjungan ?? 0)
  })

  const handleKecamatanClick = (k: KecamatanStat) => {
    setSelectedKecamatan(k)
    setIsModalOpen(true)
  }

  const handleKelurahanClick = (kelurahanNama: string) => {
    if (!selectedKecamatan) return
    setIsModalOpen(false)

    const queryParams = new URLSearchParams()
    if (selectedKecamatan.kota) {
      queryParams.set('kota', selectedKecamatan.kota)
    }
    queryParams.set('kecamatan', selectedKecamatan.kecamatan)
    queryParams.set('kelurahan', kelurahanNama)

    // Sesuaikan routing tujuan (kegiatan atau kunjungan)
    router.push(`/admin/kunjungan?${queryParams.toString()}`)
  }

  return (
    <>
      <Card className="p-4 relative w-full h-full min-h-[340px]">
        <div className="flex items-center gap-2 mb-4">
          <BsBinoculars className="text-blue-600" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Status Kegiatan Per Wilayah Kecamatan</h3>
        </div>

        <div className="space-y-3 transition-all max-h-[260px] duration-500 ease-in-out overflow-y-auto pb-12">
          {sortedStats.map((k) => {
            const totalKegiatan = k.jumlah_kunjungan ?? 0
            const kelDikunjungi = k.kelurahan_dikunjungi ?? 0
            const totalKelurahan = k.jumlah_kelurahan || 1

            // Dianggap aktif jika ada kelurahan tercover ATAU ada record kegiatan
            const visited = kelDikunjungi > 0 || totalKegiatan > 0
            const percentage = Math.min(Math.round((kelDikunjungi / totalKelurahan) * 100), 100)

            return (
              <div
                key={k.kecamatan}
                onClick={() => handleKecamatanClick(k)}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--color-border)] p-3 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-150 ease-in-out"
              >
                <div className="w-2/6 flex items-center gap-3">
                  {visited ? (
                    <MdCheckCircle size={24} className="text-green-500 shrink-0" />
                  ) : (
                    <IoMdCloseCircle size={24} className="text-red-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-[var(--color-text)] text-sm">{k.kecamatan}</p>
                  </div>
                </div>

                <div className="w-2/6 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${visited && percentage === 0 ? 10 : percentage}%`,
                    }}
                  />
                </div>

                <p className="text-xs w-1/6 text-[var(--color-text-secondary)]">
                  {kelDikunjungi}/{k.jumlah_kelurahan} kelurahan
                </p>

                <p
                  className={`text-xs font-medium ${
                    percentage < 50 ? 'text-red-500' : percentage < 75 ? 'text-yellow-500' : 'text-green-500'
                  }`}
                >
                  {percentage}%
                </p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* MODAL LIST KELURAHAN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Daftar Kelurahan - Kecamatan ${selectedKecamatan?.kecamatan || ''}`}
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-xs mb-3 text-[var(--color-text-secondary)]">
            Total kegiatan di kecamatan ini:{' '}
            <span className="font-semibold text-[var(--color-text)]">{selectedKecamatan?.jumlah_kunjungan ?? 0}</span>
          </p>

          {(() => {
            const list = selectedKecamatan?.kelurahan_list ?? []

            return list.map((kel) => {
              const countKegiatan = kel.jumlah_kunjungan ?? 0
              const isKelVisited = Boolean(kel.dikunjungi) || countKegiatan > 0

              return (
                <div
                  key={kel.nama}
                  onClick={() => handleKelurahanClick(kel.nama)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm transition-all duration-150 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow"
                >
                  <div className="flex items-center gap-2.5">
                    {isKelVisited ? (
                      <MdCheckCircle size={20} className="shrink-0 text-green-500" />
                    ) : (
                      <IoMdCloseCircle size={20} className="shrink-0 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-[var(--color-text)]">{kel.nama}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isKelVisited
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {countKegiatan} Kegiatan
                    </span>
                    <MdChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </Modal>
    </>
  )
}

export default function AdminDashboardPage(): React.ReactNode {
  const { data } = useDashboardStats()
  const router = useRouter()

  const [modalType, setModalType] = useState<string | null>(null)
  const [selectedKecamatan, setSelectedKecamatan] = useState<KecamatanStat | null>(null)

  const kecamatanStats = data?.kunjungan_per_kecamatan ?? []
  const totalKecamatan = kecamatanStats.length

  const palingBanyak = kecamatanStats.toSorted((a, b) => b.jumlah_kunjungan - a.jumlah_kunjungan)[0]
  const palingSedikit = kecamatanStats.toSorted((a, b) => a.jumlah_kunjungan - b.jumlah_kunjungan)[0]
  const rataKunjungan = totalKecamatan > 0 ? (data?.total_kegiatan ?? 0) / totalKecamatan : 0

  const kunjunganPerBulan = (data?.kunjungan_per_bulan ?? []).map((k) => ({
    label: k.bulan,
    value: k.jumlah,
  }))

  const aspirasiPerBulan = (data?.aspirasi_per_bulan ?? []).map((a) => ({
    label: a.bulan,
    value: a.jumlah,
  }))

  const aspirasiPerStatus = (data?.aspirasi_per_status ?? []).map((a) => {
    const matchLegenda = LEGENDA_STATUS.find((l) => l.label.toLowerCase() === a.status.toLowerCase())
    return {
      label: a.status,
      value: a.jumlah,
      color: matchLegenda?.color ?? '#6B7280',
    }
  })

  const aspirasiPerSumber = (data?.aspirasi_per_sumber ?? []).map((a) => {
    const matchLegenda = LEGENDA_SUMBER.find(
      (s) => s.key === a.sumber || s.label.toLowerCase() === a.sumber.toLowerCase(),
    )
    return {
      label: matchLegenda?.label ?? a.sumber,
      value: a.jumlah,
      color: matchLegenda?.color ?? 'var(--color-primary)',
    }
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const date = currentTime.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const time = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setCurrentTime(new Date())

    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <Card className="shadow-md bg-[url('/bg-stats.png')] bg-cover bg-no-repeat lg:bg-[length:120%] bg-right">
        <div className="grid lg:grid-cols-2 grid-cols-1 justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Selamat Datang, {session?.user?.name} 👋</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Statistik kegiatan dan aspirasi DPRD Jakarta Selatan
            </p>
          </div>
          <div className="flex items-end justify-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[var(--color-text-secondary)]">
              <TbCalendarWeek size={18} />
              {isMounted ? (
                <>
                  <span>{date}</span>
                  <span>|</span>
                  <span>{time} WIB</span>
                </>
              ) : (
                /* Placeholder transparan/skeleton singkat saat SSR */
                <span className="opacity-0">Loading time...</span>
              )}
            </div>
          </div>
        </div>
        {/* Rangkuman Data Total */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Kegiatan"
              value={data?.total_kegiatan ?? 0}
              icon={<MdDirectionsWalk size={24} />}
              variant="info"
              onClick={() => router.push('/admin/kunjungan')}
            />
            <StatCard
              title="Total Aspirasi"
              value={data?.total_aspirasi ?? 0}
              icon={<MdTrackChanges size={24} />}
              variant="primary"
              onClick={() => router.push('/admin/aspirasi')}
            />
            <StatCard
              title="Kelurahan Sudah Dikunjungi"
              value={data?.kelurahan_dikunjungi ?? 0}
              icon={<MdCheckCircle size={24} />}
              variant="success"
              onClick={() => router.push('/admin/dashboard/kelurahan-dikunjungi')}
            />
            <StatCard
              title="Kelurahan Belum Dikunjungi"
              value={data?.kelurahan_belum_dikunjungi ?? 0}
              icon={<MdPending size={24} />}
              variant="danger"
              onClick={() => router.push('/admin/dashboard/kelurahan-belum')}
            />
          </div>
        </div>
      </Card>

      {/* Bagian Atas: Grid untuk List Kecamatan & 3 Stat Cards Utama */}
      <div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <KecamatanList kecamatanStats={kecamatanStats} />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <StatCard
              title="Kecamatan yang Banyak Dikunjungi"
              value={`${palingBanyak?.jumlah_kunjungan ?? 0}x`}
              icon={<MdDirectionsWalk size={24} />}
              variant="primary"
              description={palingBanyak?.kecamatan ?? '-'}
              onClick={() => {
                setSelectedKecamatan(palingBanyak)
                setModalType('kecamatan-detail')
              }}
            />
            <StatCard
              title="Kecamatan yang Kurang Dikunjungi"
              value={`${palingSedikit?.jumlah_kunjungan ?? 0}x`}
              icon={<MdPending size={24} />}
              variant="warning"
              description={palingSedikit?.kecamatan ?? '-'}
              onClick={() => {
                setSelectedKecamatan(palingSedikit)
                setModalType('kecamatan-detail')
              }}
            />
            <StatCard
              title="Rata-Rata Kegiatan Per Kecamatan"
              value={rataKunjungan.toFixed(2)}
              icon={<MdTrackChanges size={24} />}
              variant="success"
              onClick={() => setModalType('rata-rata')}
            />
          </div>
        </div>
      </div>

      {/* Bagian Grafik Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChart
          title="Statistik Kegiatan per Bulan"
          data={kunjunganPerBulan}
          onBarClick={(bulan) => {
            router.push(`/admin/kunjungan?bulan=${encodeURIComponent(bulan)}`)
          }}
        />
        <BarChart
          title="Statistik Aspirasi per Bulan"
          data={aspirasiPerBulan}
          color="var(--color-warning)"
          onBarClick={(bulan) => {
            router.push(`/admin/aspirasi?bulan=${encodeURIComponent(bulan)}`)
          }}
        />
      </div>

      {/* Bagian Grafik Pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PieChart
          title="Statistik Aspirasi per Status"
          legenda={LEGENDA_STATUS}
          data={aspirasiPerStatus}
          onSliceClick={(key) => {
            router.push(`/admin/aspirasi?status=${encodeURIComponent(key)}`)
          }}
        />
        <PieChart
          title="Statistik Aspirasi per Sumber"
          legenda={LEGENDA_SUMBER}
          data={aspirasiPerSumber}
          onSliceClick={(key) => {
            router.push(`/admin/aspirasi?sumber=${encodeURIComponent(key)}`)
          }}
        />
      </div>

      {/* Modal Detail Kecamatan */}
      <Modal
        isOpen={modalType === 'kecamatan-detail' && !!selectedKecamatan}
        onClose={() => {
          setModalType(null)
          setSelectedKecamatan(null)
        }}
        title={`Detail ${selectedKecamatan?.kecamatan ?? ''}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[var(--color-bg-secondary)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-text)]">{selectedKecamatan?.jumlah_kunjungan ?? 0}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Total Kegiatan</p>
            </div>
            <div className="rounded-lg bg-[var(--color-bg-secondary)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {selectedKecamatan?.kelurahan_dikunjungi ?? 0}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">Kelurahan Dikunjungi</p>
            </div>
          </div>
          <div className="rounded-lg bg-[var(--color-bg-secondary)] p-3">
            <p className="text-sm text-[var(--color-text-secondary)]">Kecamatan</p>
            <p className="font-medium text-[var(--color-text)]">{selectedKecamatan?.kecamatan}</p>
          </div>
          <div className="rounded-lg bg-[var(--color-bg-secondary)] p-3">
            <p className="text-sm text-[var(--color-text-secondary)]">Total Kelurahan</p>
            <p className="font-medium text-[var(--color-text)]">{selectedKecamatan?.jumlah_kelurahan}</p>
          </div>
        </div>
      </Modal>

      {/* Modal Rata-Rata */}
      {/* Modal Rata-Rata */}
      <Modal
        isOpen={modalType === 'rata-rata'}
        onClose={() => setModalType(null)}
        title="Distribusi Kegiatan per Kecamatan"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* Header Info Rata-rata */}
          <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg-secondary)] p-3 text-sm font-medium">
            <span className="text-[var(--color-text-secondary)]">Rata-rata Keseluruhan</span>
            <span className="font-semibold text-[var(--color-primary)]">{rataKunjungan.toFixed(2)} kegiatan/kec</span>
          </div>

          {/* List Progress Kecamatan (Sorted: Terbanyak -> Sedikit/0) */}
          {(() => {
            // 1. Sort descending berdasarkan jumlah_kunjungan
            const sortedList = [...(kecamatanStats ?? [])].sort((a, b) => {
              const countA = a.jumlah_kunjungan ?? 0
              const countB = b.jumlah_kunjungan ?? 0
              return countB - countA
            })

            // 2. Cari nilai tertinggi untuk basis persentase bar (minimal 1 agar tidak divide by zero)
            const maxKunjungan = Math.max(...sortedList.map((k) => k.jumlah_kunjungan ?? 0), 1)

            return sortedList.map((k) => {
              const count = k.jumlah_kunjungan ?? 0
              const percentage = Math.round((count / maxKunjungan) * 100)
              const isAboveAverage = count >= rataKunjungan && count > 0

              return (
                <div
                  key={k.kecamatan}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-[var(--color-text)]">{k.kecamatan}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--color-text-secondary)]">{count} kegiatan</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          count === 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : isAboveAverage
                              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {count === 0 ? 'Belum Ada' : isAboveAverage ? '≥ Rata-rata' : '< Rata-rata'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        count === 0 ? 'bg-transparent' : isAboveAverage ? 'bg-[var(--color-primary)]' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </Modal>
    </div>
  )
}
