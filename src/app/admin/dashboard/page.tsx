'use client'
import React, { useState } from 'react'

import { useDashboardStats } from '@/hooks/useDashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { BarChart } from '@/components/dashboard/BarChart'
import { PieChart } from '@/components/dashboard/PieChart'
import { Modal } from '@/components/ui/modal'
import { useRouter } from '@/routing'
import {
  MdDirectionsWalk,
  MdTrackChanges,
  MdCheckCircle,
  MdPending,
} from 'react-icons/md'
import { IoMdCloseCircle } from "react-icons/io";
import type { KecamatanStat } from '@/types'
import { Card } from '@/components/ui/card'

const SUMBER_COLORS: Record<string, string> = {
  LEMBAR_ASPIRASI_RESES: '#3b82f6',
  LEMBAR_ASPIRASI_SOSPERDA: '#f97316',
  ASPIRASI_PROPOSAL_LANGSUNG: '#22c55e',
  KOORDINASI_DINAS_TERKAIT: '#a855f7',
  USULAN_MUSRENBANG_DEWAN: '#ef4444',
  CALL_CENTER: '#f59e0b',
}

export const KecamatanList = ({ kecamatanStats }: { kecamatanStats: KecamatanStat[] }) => {

  const sortedStats = [...kecamatanStats].sort((a, b) => {
    const aVisited = a.kelurahan_dikunjungi > 0
    const bVisited = b.kelurahan_dikunjungi > 0
    if (aVisited && !bVisited) return -1
    if (!aVisited && bVisited) return 1
    return b.kelurahan_dikunjungi - a.kelurahan_dikunjungi
  })


  return (
    <Card className="p-4 relative w-full h-full min-h-[340px]">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        Status Kunjungan Kecamatan
      </h3>
      
      <div 
        className={`space-y-3 transition-all max-h-[260px] duration-500 ease-in-out overflow-y-auto pb-12
        }`}
      >
        {sortedStats.map((k) => {
          const visited = k.kelurahan_dikunjungi > 0
          return (
            <div
              key={k.kecamatan}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 bg-white"
            >
              <div className="flex items-center gap-3">
                {visited ? (
                  <MdCheckCircle size={24} color="var(--color-success)" />
                ) : (
                  <IoMdCloseCircle size={24} color="var(--color-danger)" />
                )}
                <div>
                  <p className="font-medium text-[var(--color-text)] text-sm">{k.kecamatan}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                    {k.kelurahan_dikunjungi}/{k.jumlah_kelurahan} kelurahan
                  </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function AdminDashboardPage(): React.ReactNode {
  const { data } = useDashboardStats()
  const router = useRouter()

  const [modalType, setModalType] = useState<string | null>(null)
  const [selectedKecamatan, setSelectedKecamatan] = useState<KecamatanStat | null>(null)

  const kecamatanStats = data?.kunjungan_per_kecamatan ?? []
  const totalKecamatan = kecamatanStats.length
  
  const palingBanyak = kecamatanStats.toSorted(
    (a, b) => b.jumlah_kunjungan - a.jumlah_kunjungan
  )[0]
  const palingSedikit = kecamatanStats.toSorted(
    (a, b) => a.jumlah_kunjungan - b.jumlah_kunjungan
  )[0]
  const rataKunjungan =
    totalKecamatan > 0
      ? Math.round((data?.total_kunjungan ?? 0) / totalKecamatan)
      : 0

  const kunjunganPerBulan =
    (data?.kunjungan_per_bulan ?? []).map((k) => ({
      label: k.bulan,
      value: k.jumlah,
    }))

  const aspirasiPerBulan =
    (data?.aspirasi_per_bulan ?? []).map((a) => ({
      label: a.bulan,
      value: a.jumlah,
    }))

  const aspirasiPerStatus =
    (data?.aspirasi_per_status ?? []).map((a) => ({
      label: a.status,
      value: a.jumlah,
      color:
        a.status === 'BELUM_DITINDAKLANJUTI'
          ? 'var(--color-danger)'
          : a.status === 'SEDANG_DITINDAKLANJUTI'
            ? 'var(--color-warning)'
            : a.status === 'SUDAH_DITINDAKLANJUTI'
              ? 'var(--color-success)'
              : '#6b7280',
    }))

  const aspirasiPerSumber =
    (data?.aspirasi_per_sumber ?? []).map((a) => ({
      label: a.sumber,
      value: a.jumlah,
      color: SUMBER_COLORS[a.sumber] ?? 'var(--color-primary)',
    }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Statistik kegiatan dan aspirasi DPRD Jakarta Selatan
        </p>
      </div>

      {/* Bagian Atas: Grid untuk List Kecamatan & 3 Stat Cards Utama */}
      <div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          
          {/* Slot 1 & 2: Diisi oleh list kecamatan agar tampil lebih lebar & rapi */}
          <div className="lg:col-span-2">
            <KecamatanList kecamatanStats={kecamatanStats} />
          </div>

          {/* Slot 3 & 4: Diisi StatCards rangkuman kunjungan kecamatan */}
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
              title="Rata-rata Kegiatan/Kec"
              value={rataKunjungan}
              icon={<MdTrackChanges size={24} />}
              variant="success"
              onClick={() => setModalType('rata-rata')}
            />
          </div>
          
        </div>
      </div>

      {/* Rangkuman Data Total */}
      <div>
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

      {/* Bagian Grafik Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChart
          title="Statistik Kegiatan per Bulan"
          data={kunjunganPerBulan}
        />
        <BarChart
          title="Statistik Aspirasi per Bulan"
          data={aspirasiPerBulan}
          color="var(--color-warning)"
        />
      </div>

      {/* Bagian Grafik Pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PieChart
          title="Statistik Aspirasi per Status"
          data={aspirasiPerStatus}
          onSliceClick={(label) => {
            router.push(`/admin/aspirasi?status=${encodeURIComponent(label)}`)
          }}
        />
        <PieChart
          title="Statistik Aspirasi per Sumber"
          data={aspirasiPerSumber}
          onSliceClick={(label) => {
            router.push(`/admin/aspirasi?sumber=${encodeURIComponent(label)}`)
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
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {selectedKecamatan?.jumlah_kunjungan ?? 0}
              </p>
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
      <Modal
        isOpen={modalType === 'rata-rata'}
        onClose={() => setModalType(null)}
        title="Distribusi Kegiatan per Kecamatan"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg-secondary)] p-3 text-sm font-medium">
            <span className="text-[var(--color-text-secondary)]">Rata-rata</span>
            <span className="text-[var(--color-text)]">{rataKunjungan} kegiatan/kec</span>
          </div>
          {kecamatanStats.map((k) => (
            <div
              key={k.kecamatan}
              className="rounded-lg border border-[var(--color-border)] p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[var(--color-text)]">{k.kecamatan}</span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {k.jumlah_kunjungan} kegiatan
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--color-bg-secondary)]">
                <div
                  className="h-2 rounded-full bg-[var(--color-primary)] transition-all"
                  style={{
                    width: `${rataKunjungan > 0 ? Math.min((k.jumlah_kunjungan / rataKunjungan) * 50, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  )
}