'use client'
import React from 'react'
// 1. Import komponen chart asli dengan nama alias (misal: MuiBarChart)
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart'
import { Card } from '@/components/ui/card'

interface BarChartProps {
  title: string
  data: { label: string; value: number }[]
  color?: string
}

export const BarChart = ({
  title,
  data,
  color = 'var(--color-primary)',
}: BarChartProps): React.ReactNode => {
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1

  const chartSetting = {
    yAxis: [
      {
        label: 'Jumlah',
        width: 60,
      },
    ],
    height: 300,
  }

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <MuiBarChart
        dataset={data.map((item) => ({ month: item.label, value: item.value }))}
        xAxis={[{ scaleType: 'band', dataKey: 'month' }]} // Beberapa library chart butuh scaleType: 'band' untuk sumbu X berupa teks
        series={[{ dataKey: 'value', color: color }]} // Memanfaatkan prop color yang dilewati ke komponen
        {...chartSetting}
      />
    </Card>
  )
}