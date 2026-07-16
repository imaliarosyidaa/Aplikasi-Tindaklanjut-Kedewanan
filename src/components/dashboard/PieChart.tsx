'use client'
import React from 'react'
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart'
import { Card } from '@/components/ui/card'

interface PieChartProps {
  title: string
  data: { label: string; value: number; color: string }[]
  onSliceClick?: (label: string) => void
}

export const PieChart = ({
  title,
  data,
  onSliceClick,
}: PieChartProps): React.ReactNode => {
  // Hitung total nilai untuk mencari persentase di label samping
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1

  const settings = {
    margin: { right: 5, left: 5, top: 5, bottom: 5 },
    width: 200,
    height: 200,
    slotProps: {
      legend: { hidden: true }, // Cara resmi MUI X Charts terbaru untuk menyembunyikan legenda bawaan
    },
  }

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        {title}
      </h3>

      <div className="flex flex-row items-center justify-center gap-6">

        <div className="flex-shrink-0">
          <MuiPieChart
            series={[
              {
                innerRadius: 50,
                outerRadius: 100,
                data: data.map((item) => ({
                  id: item.label,
                  value: item.value,
                  color: item.color,
                  label: item.label
                })),
                highlightScope: { fade: 'global', highlight: 'item' },
                arcLabel: 'value',
              }
            ]}
            {...settings}
            onItemClick={(_, itemIdentifier) => {
              if (onSliceClick) {
                // Mengembalikan label saat slice diklik
                onSliceClick(data[itemIdentifier.dataIndex].label)
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          {data.map((item) => {
            const percent = ((item.value / total) * 100).toFixed(1)

            return (
              <div
                key={item.label} 
                className="flex items-center justify-between gap-4 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                onClick={() => onSliceClick?.(item.label)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}