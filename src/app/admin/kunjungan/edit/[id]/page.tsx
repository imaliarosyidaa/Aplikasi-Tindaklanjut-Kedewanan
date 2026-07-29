'use client'
import React, { use } from 'react'
import useSWR from 'swr'

import { Link } from '@/routing'
import { MdArrowBack } from 'react-icons/md'
import { FormKunjungan } from '@/components/forms/FormKunjungan'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditKegiatanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: kegiatan, isLoading } = useSWR(`/api/kegiatan/${id}`, fetcher)

  return (
    <div className="w-full mx-auto space-y-6">
      <Link
        href="/admin/kunjungan"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        <MdArrowBack size={16} />
        Kembali ke Daftar Kunjungan
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Edit Kegiatan
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {kegiatan?.nama_kegiatan}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <FormKunjungan initialData={kegiatan} />
        </div>
      )}
    </div>
  )
}
