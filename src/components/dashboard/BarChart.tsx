'use client'
import React from 'react'

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
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-[var(--color-text-secondary)]">
              {item.label}
            </span>
            <div className="flex-1 h-5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="w-8 text-right text-xs font-medium text-[var(--color-text)]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
