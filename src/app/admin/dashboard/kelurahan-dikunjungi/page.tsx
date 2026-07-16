'use client'
import React, { useState, useMemo, useEffect } from 'react'

import { useKunjunganList } from '@/hooks/useKunjungan'
import {
  MdArrowBack,
  MdCheckCircle,
} from 'react-icons/md'
import { Link } from '@/routing'
import { Pagination } from '@/components/ui/pagination'
import { MASTER_WILAYAH } from '@/utils/masterWilayah'
import type { Kunjungan } from '@/types'
export default function KelurahanDikunjungiPage(): React.ReactNode {
  const { data: kunjunganList } = useKunjunganList()

  const allKelurahan = MASTER_WILAYAH.flatMap((kec) =>
    kec.kelurahan.map((kel) => ({
      ...kel,
      kecamatan: kec.nama,
    }))
  )

  const visitedKelurahan = allKelurahan.filter((kel) => {
    return (kunjunganList ?? []).some(
      (k: Kunjungan) => k.kelurahan === kel.nama
    )
  })

  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(1)
  const paginatedData = visitedKelurahan.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  useEffect(() => { setCurrentPage(1) }, [visitedKelurahan.length])

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard">
        <button className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline">
          <MdArrowBack size={16} />
          Kembali
        </button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Kelurahan Sudah Dikunjungi
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {visitedKelurahan.length} kelurahan sudah dikunjungi
        </p>
      </div>

      {visitedKelurahan.length === 0 ? (
        <p className="text-[var(--color-text-secondary)]">
          Belum ada kelurahan yang dikunjungi
        </p>
      ) : (
          <>
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                  No
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                  Kelurahan
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                  Kecamatan
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((kel, i) => (
                <tr
                  key={kel.id}
                  className="border-t border-[var(--color-border)]"
                >
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2 text-[var(--color-text)]">
                    <MdCheckCircle size={16} className="text-[var(--color-success)]" />
                    {kel.nama}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {kel.kecamatan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalItems={visitedKelurahan.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
