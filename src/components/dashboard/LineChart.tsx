'use client'

import React from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'
interface LineChartProps {
  title: string
  data: { label: string; value: number }[]
  color?: string
}

export const LineChart = ({
  title,
  data,
  color = 'var(--color-primary)',
}: LineChartProps): React.ReactNode => {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const chartHeight = 160
  const chartWidth = 100
  const padding = 30

  const points = data.map((item, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (chartWidth - padding)
    const y = chartHeight - padding - (item.value / maxValue) * (chartHeight - padding * 2)
    return { x, y, ...item }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD =
    pathD +
    ` L ${points[points.length - 1]?.x ?? 0} ${chartHeight - padding} L ${points[0]?.x ?? 0} ${chartHeight - padding} Z`

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((pct) => {
            const y = chartHeight - padding - (pct / 100) * (chartHeight - padding * 2)
            return (
              <line
                key={pct}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
            )
          })}

          {areaD && (
            <path
              d={areaD}
              fill={`url(#gradient-${title})`}
            />
          )}

          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="2"
                fill={color}
                stroke="var(--color-bg)"
                strokeWidth="0.5"
              />
              <text
                x={p.x}
                y={chartHeight - 5}
                textAnchor="middle"
                fontSize="5"
                fill="var(--color-text-secondary)"
              >
                {p.label}
              </text>
              {p.value > 0 && (
                <text
                  x={p.x}
                  y={p.y - 5}
                  textAnchor="middle"
                  fontSize="5"
                  fill="var(--color-text)"
                  fontWeight="bold"
                >
                  {p.value}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </Card>
  )
}
