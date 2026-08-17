'use client'

import React from 'react'

interface FilterLaporanProps {
  children: React.ReactNode
  searched?: boolean
  imageSrc?: string
}

export default function FilterLaporan({ children, searched = false, imageSrc = '/laporan.png' }: FilterLaporanProps) {
  return (
    <div className="lg:px-16 p-4 w-full relative z-10 mx-auto border-purple-200">
      <div className="space-y-4">
        <p className="text-sm font-medium text-[var(--color-text)]">Filter & Pencarian Laporan</p>

        {/* Isian form dipasangkan via children di sini */}
        {children}
      </div>
    </div>
  )
}
