'use client'
import React, { use } from 'react'
import useSWR from 'swr'

import { Link } from '@/routing'
import { MdArrowBack } from 'react-icons/md'
import { FormRelawan } from '@/components/forms/FormRelawan'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditRelawanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: relawan } = useSWR(`/api/relawan/${id}`, fetcher)

  if (!relawan) return <p className="text-[var(--color-text-secondary)]">Relawan tidak ditemukan</p>

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
          Edit Relawan
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {relawan.nama}
        </p>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
        <FormRelawan initialData={relawan} />
      </div>
    </div>
  )
}
