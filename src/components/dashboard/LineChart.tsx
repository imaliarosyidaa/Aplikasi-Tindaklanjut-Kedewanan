'use client'

import React from 'react'

import { Card } from '@/components/ui/card'
import { LineChart as MuiLineChart } from '@mui/x-charts/LineChart'
import { useRouter } from '@/routing'

interface LineChartProps {
  title: string
  data: { label: string; value: number }[]
  color?: string
  targetUrl?: string
  onPointClick?: (monthLabel: string) => void
}

export const LineChart = ({
  title,
  data,
  color = 'var(--color-primary)',
  targetUrl,
  onPointClick,
}: LineChartProps): React.ReactNode => {
  const router = useRouter()

  const handleItemClick = (_: unknown, itemIdentifier: { dataIndex?: number }) => {
    if (itemIdentifier.dataIndex === undefined) return
    const selectedItem = data[itemIdentifier.dataIndex]
    if (!selectedItem) return

    const monthLabel = selectedItem.label
    if (onPointClick) onPointClick(monthLabel)
    if (targetUrl) router.push(`${targetUrl}?bulan=${encodeURIComponent(monthLabel)}`)
  }

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>

      <MuiLineChart
        dataset={data.map((item) => ({ month: item.label, value: item.value }))}
        xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
        yAxis={[{ label: 'Jumlah', width: 60 }]}
        height={300}
        series={[
          {
            dataKey: 'value',
            label: 'Jumlah',
            color,
            valueFormatter: (v) => `${v ?? 0} aspirasi`,
            curve: 'linear',
          },
        ]}
        slotProps={{ tooltip: { trigger: 'axis' as const } }}
        onAreaClick={handleItemClick}
      />
    </Card>
  )
}
