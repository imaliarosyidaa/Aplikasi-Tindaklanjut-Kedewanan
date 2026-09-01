'use client'

import React, { useCallback, useRef, useState } from 'react'
import { BarChart as MuiBarChart } from '@mui/x-charts'
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

// Menentukan bulan yang di-hover berdasarkan posisi x pointer relatif terhadap
// area plot. Area plot = lebar container dikurangi y-axis (lebar 60) + padding.
function monthFromPointerX(x: number, containerWidth: number, labels: string[]): string | null {
  if (containerWidth <= 0 || labels.length === 0) return null
  const yAxisWidth = 60 // yAxis width di chartSetting
  const padding = 8
  const plotWidth = Math.max(1, containerWidth - yAxisWidth - padding * 2)
  const bandWidth = plotWidth / labels.length
  const index = Math.floor((x - yAxisWidth - padding) / bandWidth)
  if (index < 0 || index >= labels.length) return null
  return labels[index]
}

interface CustomTooltipProps {
  month: string
  total: number
  items: Kegiatan[]
  color: string
}

// Custom tooltip yang menampilkan jumlah + nama kegiatan + lokasi per bulan
function CustomTooltip({ month, total, items, color }: CustomTooltipProps) {
  return (
    <div className="pointer-events-none min-w-[220px] max-w-[320px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">{month}</span>
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
                  <p className="truncate text-xs font-medium text-[var(--color-text)]">
                    {item.nama_kegiatan || 'Kegiatan'}
                  </p>
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

  // Posisi pointer relatif terhadap container chart (koordinat tooltip)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  // Lebar container, hanya diisi setelah mount (lewat ResizeObserver) agar tidak
  // memengaruhi render SSR (mencegah hydration mismatch).
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ukur lebar container secara real-time (responsive terhadap resize/sidebar).
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      if (el.clientWidth !== 0) setContainerWidth(el.clientWidth)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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

  const totalByMonth = (monthLabel: string): number => kegiatanByMonth(monthLabel).length

  const isKegiatanChart = title.toLowerCase().includes('kegiatan')

  // Hitung posisi pointer relatif terhadap chart container (bukan viewport)
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    // Pertahankan posisi terakhir saat mouse berhenti; jangan pernah reset ke 0,0
    setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }, [])

  const handlePointerLeave = useCallback(() => {
    // Cursor keluar chart -> tooltip hilang (default MUI behavior)
    setPointer(null)
  }, [])

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

  // Tentukan bulan yang di-hover dari posisi pointer (deterministik, tanpa store MUI)
  const hoverMonth = !isKegiatanChart || !pointer
    ? null
    : monthFromPointerX(pointer.x, containerWidth, data.map((d) => d.label))

  const showTooltip = isKegiatanChart && pointer && hoverMonth

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>

      <div
        ref={containerRef}
        className="relative"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
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
          slotProps={{ tooltip: { trigger: 'none' } }}
          axisHighlight={{ x: 'line', y: 'none' }}
          onItemClick={handleItemClick}
          {...chartSetting}
        />

        {showTooltip && (
          <HoverTooltip
            x={pointer.x}
            y={pointer.y}
            month={hoverMonth}
            total={totalByMonth(hoverMonth)}
            items={kegiatanByMonth(hoverMonth)}
            color={color}
            containerWidth={containerWidth}
          />
        )}
      </div>

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

// Tooltip yang diposisikan relatif terhadap container chart.
function HoverTooltip({
  x,
  y,
  month,
  total,
  items,
  color,
  containerWidth,
}: {
  x: number
  y: number
  month: string
  total: number
  items: Kegiatan[]
  color: string
  containerWidth: number
}) {
  // Offset kecil agar tooltip tidak menutupi kursor bar.
  const OFFSET_X = 16
  const TOOLTIP_WIDTH = 320 // max-w-[320px]

  // Pertahankan posisi terakhir kursor; hanya clamp agar tidak keluar container.
  const left = Math.min(x + OFFSET_X, Math.max(0, containerWidth - TOOLTIP_WIDTH))

  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{ left, top: y, transform: 'none' }}
    >
      <CustomTooltip month={month} total={total} items={items} color={color} />
    </div>
  )
}
