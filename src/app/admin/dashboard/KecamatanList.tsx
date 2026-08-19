'use client'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { KecamatanStat } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BsBinoculars } from 'react-icons/bs'
import { IoMdCloseCircle } from 'react-icons/io'
import { MdCheckCircle, MdChevronRight } from 'react-icons/md'

export const KecamatanList = ({ kecamatanStats }: { kecamatanStats: KecamatanStat[] }) => {
  const router = useRouter()

  const [selectedKecamatan, setSelectedKecamatan] = useState<KecamatanStat | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sort: Prioritaskan yang punya kegiatan/kelurahan dikunjungi > 0
  const sortedStats = [...(kecamatanStats ?? [])].sort((a, b) => {
    const aCount = (a.kelurahan_dikunjungi ?? 0) > 0 || (a.jumlah_kunjungan ?? 0) > 0
    const bCount = (b.kelurahan_dikunjungi ?? 0) > 0 || (b.jumlah_kunjungan ?? 0) > 0
    if (aCount && !bCount) return -1
    if (!aCount && bCount) return 1
    return (b.kelurahan_dikunjungi ?? b.jumlah_kunjungan ?? 0) - (a.kelurahan_dikunjungi ?? a.jumlah_kunjungan ?? 0)
  })

  const handleKecamatanClick = (k: KecamatanStat) => {
    setSelectedKecamatan(k)
    setIsModalOpen(true)
  }

  const handleKelurahanClick = (kelurahanNama: string) => {
    if (!selectedKecamatan) return
    setIsModalOpen(false)

    const queryParams = new URLSearchParams()
    if (selectedKecamatan.kota) {
      queryParams.set('kota', selectedKecamatan.kota)
    }
    queryParams.set('kecamatan', selectedKecamatan.kecamatan)
    queryParams.set('kelurahan', kelurahanNama)

    // Sesuaikan routing tujuan (kegiatan atau kunjungan)
    router.push(`/admin/kunjungan?${queryParams.toString()}`)
  }

  return (
    <>
      <Card className="p-4 relative w-full h-full min-h-[340px]">
        <div className="flex items-center gap-2 mb-4">
          <BsBinoculars className="text-blue-600" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Status Kegiatan Per Wilayah Kecamatan</h3>
        </div>

        <div className="space-y-3 transition-all max-h-[260px] duration-500 ease-in-out overflow-y-auto pb-12">
          {sortedStats.map((k) => {
            const totalKegiatan = k.jumlah_kunjungan ?? 0
            const kelDikunjungi = k.kelurahan_dikunjungi ?? 0
            const totalKelurahan = k.jumlah_kelurahan || 1

            // Dianggap aktif jika ada kelurahan tercover ATAU ada record kegiatan
            const visited = kelDikunjungi > 0 || totalKegiatan > 0
            const percentage = Math.min(Math.round((kelDikunjungi / totalKelurahan) * 100), 100)

            return (
              <div
                key={k.kecamatan}
                onClick={() => handleKecamatanClick(k)}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--color-border)] p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-150 ease-in-out"
              >
                <div className="w-2/6 flex items-center gap-3">
                  {visited ? (
                    <MdCheckCircle size={24} className="text-green-500 shrink-0" />
                  ) : (
                    <IoMdCloseCircle size={24} className="text-red-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-[var(--color-text)] text-sm">{k.kecamatan}</p>
                  </div>
                </div>

                <div className="h-2 w-2/6 rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-300"
                    style={{
                      width: `${visited && percentage === 0 ? 10 : percentage}%`,
                    }}
                  />
                </div>

                <p className="text-xs w-1/6 text-[var(--color-text-secondary)]">
                  {kelDikunjungi}/{k.jumlah_kelurahan} kelurahan
                </p>

                <p
                  className={`text-xs font-medium ${
                    percentage < 50 ? 'text-red-500' : percentage < 75 ? 'text-yellow-500' : 'text-green-500'
                  }`}
                >
                  {percentage}%
                </p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* MODAL LIST KELURAHAN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Daftar Kelurahan - Kecamatan ${selectedKecamatan?.kecamatan || ''}`}
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-xs mb-3 text-[var(--color-text-secondary)]">
            Total kegiatan di kecamatan ini:{' '}
            <span className="font-semibold text-[var(--color-text)]">{selectedKecamatan?.jumlah_kunjungan ?? 0}</span>
          </p>

          {(() => {
            const list = selectedKecamatan?.kelurahan_list ?? []

            return list.map((kel) => {
              const countKegiatan = kel.jumlah_kunjungan ?? 0
              const isKelVisited = Boolean(kel.dikunjungi) || countKegiatan > 0

              return (
                <div
                  key={kel.nama}
                  onClick={() => handleKelurahanClick(kel.nama)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm transition-all duration-150 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow"
                >
                  <div className="flex items-center gap-2.5">
                    {isKelVisited ? (
                      <MdCheckCircle size={20} className="shrink-0 text-green-500" />
                    ) : (
                      <IoMdCloseCircle size={20} className="shrink-0 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-[var(--color-text)]">{kel.nama}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isKelVisited
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {countKegiatan} Kegiatan
                    </span>
                    <MdChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </Modal>
    </>
  )
}
