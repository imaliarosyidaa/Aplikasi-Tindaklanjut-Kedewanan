'use client'
import React from 'react'

import { Card } from '@/components/ui/card'
import { Link } from '@/routing'
import { MdAdd, MdTrackChanges } from 'react-icons/md'

export default function DashboardHomePage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Dashboard Pengguna
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Selamat datang di portal aspirasi masyarakat
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link href="/dashboard/pengajuan-aspirasi">
          <Card className="p-6 flex flex-col items-center text-center space-y-3 bg-blue-50 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <MdAdd size={32} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Pengajuan Aspirasi
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Ajukan aspirasi atau pengaduan Anda
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/laporan-saya">
          <Card className="p-6 flex flex-col items-center text-center space-y-3 bg-purple-50 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
              <MdTrackChanges size={32} className="text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Laporan Saya
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Lacak status aspirasi yang sudah diajukan
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
