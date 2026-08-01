'use client'

import React from 'react'
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart'
import { Card } from '@/components/ui/card'

export interface LegendItem {
  key?: string // Opsional: Untuk matching langsung dengan Enum DB (contoh: 'BELUM_DITINDAKLANJUTI')
  label: string
  color: string
}

interface PieChartProps {
  title: string
  data: { label: string; value: number; color?: string }[]
  legenda?: LegendItem[] // Master legenda (opsional)
  onSliceClick?: (label: string) => void
}

// Helper untuk mentransformasi string agar matching aman (misal: "BELUM_DITINDAKLANJUTI" -> "belum ditindaklanjuti")
const normalizeStr = (str: string) =>
  str ? str.replace(/_/g, ' ').replace(/-/g, ' ').trim().toLowerCase() : ''

export const PieChart = ({
  title,
  data = [],
  legenda = [],
  onSliceClick,
}: PieChartProps): React.ReactNode => {

  // 1. Ambil semua item dari master legenda & cari match dari DB
  const mergedList: { label: string; value: number; color: string; rawKey: string }[] = legenda.map(
    (fixed, idx) => {
      const fixedNorm = normalizeStr(fixed.label)
      const keyNorm = fixed.key ? normalizeStr(fixed.key) : ''

      const found = data.find((d) => {
        const dbNorm = normalizeStr(d.label)
        return dbNorm === fixedNorm || (keyNorm !== '' && dbNorm === keyNorm)
      })

      return {
        label: fixed.label,
        value: found ? found.value : 0,
        color: fixed.color || found?.color || "#888888",
        rawKey: found ? found.label : (fixed.key || fixed.label),
      }
    }
  )

  // 2. Tambahkan data dari DB yang belum tercover di master legenda (Dynamic Entry)
  data.forEach((dbItem, idx) => {
    const dbNorm = normalizeStr(dbItem.label)
    const isAlreadyInMaster = legenda.some(
      (m) => normalizeStr(m.label) === dbNorm || (m.key && normalizeStr(m.key) === dbNorm)
    )

    if (!isAlreadyInMaster) {
      // Format Teks agar Rapi jika terdeteksi Enum
      const formattedLabel = dbItem.label.includes('_')
        ? dbItem.label
          .toLowerCase()
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        : dbItem.label

      mergedList.push({
        label: formattedLabel,
        value: dbItem.value,
        color: dbItem?.color || '#888888',
        rawKey: dbItem?.label,
      })
    }
  })

  const total = mergedList.reduce((sum, d) => sum + d.value, 0) || 1

  // Filter hanya slice > 0 untuk dirender di MUI Chart
  const chartSeriesData = mergedList
    .filter((item) => item.value > 0)
    .map((item) => ({
      id: item.label,
      value: item.value,
      color: item.color,
      label: item.label,
      rawKey: item.rawKey,
    }))

  const settings = {
    margin: { right: 5, left: 5, top: 5, bottom: 5 },
    width: 200,
    height: 200,
    slotProps: {
      legend: { hidden: true },
    },
  }

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        {title}
      </h3>

      <div className="flex flex-row items-center justify-center gap-6">
        {/* CHART AREA */}
        <div className="flex-shrink-0">
          {chartSeriesData.length > 0 ? (
            <MuiPieChart
              series={[
                {
                  innerRadius: 50,
                  outerRadius: 100,
                  data: chartSeriesData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  arcLabel: 'value',
                },
              ]}
              {...settings}
              onItemClick={(_, itemIdentifier) => {
                if (onSliceClick) {
                  onSliceClick(chartSeriesData[itemIdentifier.dataIndex].rawKey)
                }
              }}
            />
          ) : (
            <div className="w-[200px] h-[200px] rounded-full border-4 border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
              Belum ada data
            </div>
          )}
        </div>

        {/* LEGENDA */}
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {mergedList.map((item) => {
            const percent = ((item.value / total) * 100).toFixed(1)

            return (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 text-xs cursor-pointer hover:bg-[var(--color-bg-secondary)] p-1.5 rounded transition-colors"
                onClick={() => onSliceClick?.(item.rawKey)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate font-medium text-[var(--color-text)]">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text)]">
                    {item.value}
                  </span>
                  <span className="text-[10px]">({percent}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}