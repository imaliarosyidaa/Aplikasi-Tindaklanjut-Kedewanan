'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { useDashboardStats } from '@/hooks/useDashboard'
import { useAspirasiList } from '@/hooks/useAspirasi'
import { StatCard } from '@/components/dashboard/StatCard'
import { BarChart } from '@/components/dashboard/BarChart'
import { PieChart } from '@/components/dashboard/PieChart'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { useRouter } from '@/routing'
import {
  MdDirectionsWalk,
  MdTrackChanges,
  MdCheckCircle,
  MdPending,
  MdLocationOn,
} from 'react-icons/md'
import type { KecamatanStat } from '@/types'

const SUMBER_COLORS: Record<string, string> = {
  LEMBAR_ASPIRASI_RESES: '#3b82f6',
  LEMBAR_ASPIRASI_SOSPERDA: '#f97316',
  ASPIRASI_PROPOSAL_LANGSUNG: '#22c55e',
  KOORDINASI_DINAS_TERKAIT: '#a855f7',
  USULAN_MUSRENBANG_DEWAN: '#ef4444',
  CALL_CENTER: '#f59e0b',
}

export default function AdminDashboardPage(): React.ReactNode {
  const t = useTranslations('Dashboard')
  const s = useTranslations('Sumber')
  const aspirasiT = useTranslations('Aspirasi')
  const { data, isLoading } = useDashboardStats()
  const { data: aspirasiList } = useAspirasiList()
  const router = useRouter()

  const [modalType, setModalType] = useState<string | null>(null)
  const [selectedKecamatan, setSelectedKecamatan] = useState<KecamatanStat | null>(null)
  const [selectedSumber, setSelectedSumber] = useState<string | null>(null)

  const kecamatanStats = data?.kunjungan_per_kecamatan ?? []
  const totalKecamatan = kecamatanStats.length
  const kecamatanDikunjungi = kecamatanStats.filter(
    (k) => k.kelurahan_dikunjungi > 0
  ).length
  const palingBanyak = kecamatanStats.toSorted(
    (a, b) => b.jumlah_kunjungan - a.jumlah_kunjungan
  )[0]
  const palingSedikit = kecamatanStats.toSorted(
    (a, b) => a.jumlah_kunjungan - b.jumlah_kunjungan
  )[0]
  const rataKunjungan =
    totalKecamatan > 0
      ? Math.round(
          (data?.total_kunjungan ?? 0) / totalKecamatan
        )
      : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      </div>
    )
  }

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
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Statistik kegiatan dan aspirasi DPRD Jakarta Selatan
        </p>
      </div>

      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Kecamatan Dikunjungi"
            value={`${kecamatanDikunjungi}/${totalKecamatan}`}
            icon={<MdCheckCircle size={24} />}
            variant="info"
            onClick={() => setModalType('dikunjungi')}
          />
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

      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('totalKunjungan')}
            value={data?.total_kunjungan ?? 0}
            icon={<MdDirectionsWalk size={24} />}
            variant="info"
            onClick={() => router.push('/admin/dashboard/kunjungan')}
          />
          <StatCard
            title={t('totalAspirasi')}
            value={data?.total_aspirasi ?? 0}
            icon={<MdTrackChanges size={24} />}
            variant="primary"
            onClick={() => router.push('/admin/aspirasi')}
          />
          <StatCard
            title={t('kelurahanDikunjungi')}
            value={data?.kelurahan_dikunjungi ?? 0}
            icon={<MdCheckCircle size={24} />}
            variant="success"
            onClick={() => router.push('/admin/dashboard/kelurahan-dikunjungi')}
          />
          <StatCard
            title={t('kelurahanBelumDikunjungi')}
            value={data?.kelurahan_belum_dikunjungi ?? 0}
            icon={<MdPending size={24} />}
            variant="danger"
            onClick={() => router.push('/admin/dashboard/kelurahan-belum')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChart
          title={t('kunjunganPerBulan')}
          data={kunjunganPerBulan}
        />
        <BarChart
          title={t('aspirasiPerBulan')}
          data={aspirasiPerBulan}
          color="var(--color-warning)"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PieChart
          title={t('aspirasiPerStatus')}
          data={aspirasiPerStatus}
        />
        <PieChart
          title={t('aspirasiPerSumber')}
          data={aspirasiPerSumber}
          onSliceClick={(label) => {
            setSelectedSumber(label)
            setModalType('sumber-detail')
          }}
        />
      </div>

      <Modal
        isOpen={modalType === 'dikunjungi'}
        onClose={() => setModalType(null)}
        title="Status Kegiatan Kecamatan"
      >
        <div className="space-y-3">
          {kecamatanStats.map((k) => {
            const visited = k.kelurahan_dikunjungi > 0
            return (
              <div
                key={k.kecamatan}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
              >
                <div className="flex items-center gap-3">
                  <MdLocationOn
                    size={20}
                    className={visited ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}
                  />
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{k.kecamatan}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {k.kelurahan_dikunjungi}/{k.jumlah_kelurahan} kelurahan
                    </p>
                  </div>
                </div>
                <Badge variant={visited ? 'success' : 'danger'}>
                  {visited ? 'Dikunjungi' : 'Belum'}
                </Badge>
              </div>
            )
          })}
        </div>
      </Modal>

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

      <Modal
        isOpen={modalType === 'sumber-detail' && !!selectedSumber}
        onClose={() => {
          setModalType(null)
          setSelectedSumber(null)
        }}
        title={`Aspirasi — ${selectedSumber ? s(selectedSumber) : ''}`}
      >
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kecamatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kelurahan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Lokasi</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Status</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {aspirasiList
                .filter((a) => a.sumber === selectedSumber)
                .map((a, i) => (
                  <tr
                    key={a.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                  >
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">{a.kecamatan ?? '-'}</td>
                    <td className="px-4 py-3">{a.kelurahan ?? '-'}</td>
                    <td className="px-4 py-3">{a.lokasi ?? '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge status={a.status}>{aspirasiT(a.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">{a.tanggal_dibuat}</td>
                  </tr>
                ))}
              {aspirasiList.filter((a) => a.sumber === selectedSumber).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                    Tidak ada data aspirasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )
}
