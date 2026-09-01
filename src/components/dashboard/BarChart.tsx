'use client'

import React, { useState } from 'react'
import { BarChart as MuiBarChart, useAxesTooltip, ChartsTooltipContainer, type ChartsTooltipProps } from '@mui/x-charts'
import { Card } from '@/components/ui/card'
import { useRouter } from '@/routing'
import useSWR from 'swr'
import { Kegiatan } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BarChartProps {
  title: string
  data: { label: string; value: number }[]
  color?: string
  targetUrl?: string
  onBarClick?: (monthLabel: string) => void
}

// Helper mencocokkan filter bulan dengan tanggal kegiatan
const isMatchingMonth = (dateOrMonthString: string | undefined, paramBulan: string) => {
  if (!dateOrMonthString || !paramBulan) return true

  const target = paramBulan.toLowerCase().trim()
  const val = dateOrMonthString.toLowerCase().trim()

  if (val.includes(target)) return true

  const parsedDate = new Date(dateOrMonthString)
  if (!isNaN(parsedDate.getTime())) {
    const monthIndex = parsedDate.getMonth()
    const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des']
    const fullMonthNames = [
      'januari',
      'februari',
      'maret',
      'april',
      'mei',
      'juni',
      'juli',
      'agustus',
      'september',
      'oktober',
      'november',
      'desember',
    ]

    return (
      shortMonthNames[monthIndex].includes(target) ||
      fullMonthNames[monthIndex].includes(target) ||
      target === String(monthIndex + 1) ||
      target === String(monthIndex + 1).padStart(2, '0')
    )
  }

  return false
}

interface CustomTooltipProps {
  kegiatanByMonth: (monthLabel: string) => Kegiatan[]
  totalByMonth: (monthLabel: string) => number
  color: string
}

// Custom tooltip yang menampilkan jumlah + nama kegiatan + lokasi per bulan
function CustomTooltip({ kegiatanByMonth, totalByMonth, color }: CustomTooltipProps) {
  const axesTooltip = useAxesTooltip()

  const axis = axesTooltip?.[0]
  const axisVal = axis?.axisValue ?? axis?.axisFormattedValue
  const monthLabel = String(axisVal ?? '')

  if (!monthLabel) return null

  const items = kegiatanByMonth(monthLabel)
  const total = totalByMonth(monthLabel)

  return (
    <div className="min-w-[220px] max-w-[320px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">{monthLabel}</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {total} kegiatan
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-[var(--color-text-secondary)]">Tidak ada kegiatan pada bulan ini.</p>
      ) : (
        <ul className="max-h-56 overflow-y-auto space-y-2 pr-1">
          {items.map((item, idx) => {
            const lokasi = [item.kecamatan, item.kelurahan].filter(Boolean).join(', ')
            return (
              <li key={item.id || idx} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--color-text)]">{item.nama_kegiatan || 'Kegiatan'}</p>
                  {lokasi && <p className="truncate text-[11px] text-[var(--color-text-secondary)]">{lokasi}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export const BarChart = ({
  title,
  data,
  color = 'var(--color-primary)',
  targetUrl,
  onBarClick,
}: BarChartProps): React.ReactNode => {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  // Fetch semua kegiatan (API tidak mendukung filter bulan server-side)
  const { data: res, isLoading } = useSWR<{ data: Kegiatan[]; total: number } | Kegiatan[]>(
    '/api/kegiatan',
    fetcher,
  )

  const allKegiatan = Array.isArray(res) ? res : (res?.data ?? [])

  // Kelompokkan kegiatan berdasarkan bulan (gunakan label chart)
  const kegiatanByMonth = (monthLabel: string): Kegiatan[] => {
    return allKegiatan.filter((item) => {
      const tanggal = item.tanggal || (item as unknown as Record<string, string>).tanggal_kegiatan || ''
      return isMatchingMonth(tanggal, monthLabel)
    })
  }

  const totalByMonth = (monthLabel: string): number => {
    return kegiatanByMonth(monthLabel).length
  }

  const chartSetting = {
    yAxis: [{ label: 'Jumlah', width: 60 }],
    height: 300,
  }

  const handleItemClick = (_: unknown, itemIdentifier: { dataIndex: number }) => {
    const selectedItem = data[itemIdentifier.dataIndex]
    if (!selectedItem) return

    const monthLabel = selectedItem.label
    setSelectedMonth(monthLabel)

    if (onBarClick) onBarClick(monthLabel)
    if (targetUrl) router.push(`${targetUrl}?bulan=${encodeURIComponent(monthLabel)}`)
  }

  const isKegiatanChart = title.toLowerCase().includes('kegiatan')

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>

      <MuiBarChart
        dataset={data.map((item) => ({ month: item.label, value: item.value }))}
        xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
        series={[
          {
            dataKey: 'value',
            label: 'Jumlah',
            color,
            valueFormatter: (v) => `${v ?? 0} kegiatan`,
          },
        ]}
        slots={
          isKegiatanChart
            ? ({
                // Terima props dari slotProps.tooltip agar ChartsTooltipContainer
                // memakai anchor/position default yang benar dan tidak melompat
                // ke pojok chart saat pointer diam/keluar.
                tooltip: (props: ChartsTooltipProps<'axis'>) => (
                  <ChartsTooltipContainer
                    {...(props as unknown as React.ComponentProps<typeof ChartsTooltipContainer>)}
                    trigger="axis"
                    anchor="pointer"
                  >
                    <CustomTooltip
                      kegiatanByMonth={kegiatanByMonth}
                      totalByMonth={totalByMonth}
                      color={color}
                    />
                  </ChartsTooltipContainer>
                ),
              } as NonNullable<React.ComponentProps<typeof MuiBarChart>['slots']>)
            : undefined
        }
        slotProps={{ tooltip: { trigger: 'axis' as const } }}
        onItemClick={handleItemClick}
        {...chartSetting}
      />

      {selectedMonth && isKegiatanChart && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Detail Kegiatan Bulan: <span className="text-primary">{selectedMonth}</span>
            </h4>
            {isLoading ? null : (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Total: {totalByMonth(selectedMonth)}</span>
            )}
          </div>

          {isLoading ? (
            <p className="text-xs text-gray-500 py-2">Memuat daftar kegiatan...</p>
          ) : kegiatanByMonth(selectedMonth).length > 0 ? (
            <ul className="divide-y text-xs max-h-48 overflow-y-auto">
              {kegiatanByMonth(selectedMonth).map((item, idx) => (
                <li key={item.id || idx} className="py-2 flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.nama_kegiatan || ''}</p>
                    <p className="text-gray-500 truncate">
                      {[item.kecamatan, item.kelurahan].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400 py-2">Tidak ada detail kegiatan untuk bulan ini.</p>
          )}
        </div>
      )}
    </Card>
  )
}
