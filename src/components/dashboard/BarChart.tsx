'use client'

import React from 'react'
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart'
import { Card } from '@/components/ui/card'
import { useRouter } from '@/routing'

interface BarChartProps {
  title: string
  data: { label: string; value: number }[]
  color?: string
  targetUrl?: string
  onBarClick?: (monthLabel: string) => void
}

export const BarChart = ({
  title,
  data,
  color = 'var(--color-primary)',
  targetUrl,
  onBarClick,
}: BarChartProps): React.ReactNode => {
  const router = useRouter()

  const chartSetting = {
    yAxis: [
      {
        label: 'Jumlah',
        width: 60,
      },
    ],
    height: 300,
  }

  const handleItemClick = (_: unknown, itemIdentifier: { dataIndex: number }) => {
    const selectedItem = data[itemIdentifier.dataIndex]
    if (!selectedItem) return

    const monthLabel = selectedItem.label

    if (onBarClick) {
      onBarClick(monthLabel)
    }

    if (targetUrl) {
      router.push(`${targetUrl}?bulan=${encodeURIComponent(monthLabel)}`)
    }
  }

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <MuiBarChart
        dataset={data.map((item) => ({ month: item.label, value: item.value }))}
        xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
        series={[{ dataKey: 'value', color: color }]}
        onItemClick={handleItemClick} // 🛠️ Menambahkan Event Listener Click MUI Chart
        {...chartSetting}
      />
    </Card>
  )
}