'use client'
import React from 'react'

import { Link } from '@/routing'
import { FormRelawan } from '@/components/forms/FormRelawan'
import { MdArrowBack } from 'react-icons/md'

export default function RelawanBaruPage(): React.ReactNode {
  return (
    <div className="w-full mx-auto space-y-6">
      <Link
        href="/admin/relawan"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        <MdArrowBack size={16} />
        Kembali ke Data Relawan
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Tambah Relawan
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Input data relawan baru
        </p>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
        <FormRelawan />
      </div>
    </div>
  )
}
