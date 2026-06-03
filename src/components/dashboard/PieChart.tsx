'use client'
import React from 'react'

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
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  let cumulativePercent = 0

  const slices = data.map((item) => {
    const percent = (item.value / total) * 100
    const startPercent = cumulativePercent
    cumulativePercent += percent
    return { ...item, percent, startPercent }
  })

  const conicGradient = slices
    .map(
      (slice) =>
        `${slice.color} ${slice.startPercent}% ${slice.startPercent + slice.percent}%`
    )
    .join(', ')

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <div className="flex items-center gap-6">
        <div
          className="relative h-32 w-32 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${conicGradient})` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-[var(--color-text)]">{total}</span>
          </div>
        </div>
        <div className="space-y-2">
          {slices.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 ${onSliceClick ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={() => onSliceClick?.(item.label)}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-[var(--color-text-secondary)]">
                {item.label} ({item.value}) — {Math.round(item.percent)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
