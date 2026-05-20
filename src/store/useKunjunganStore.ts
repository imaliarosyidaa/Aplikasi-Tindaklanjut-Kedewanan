import { create } from 'zustand'
import type { Kunjungan } from '@/types'

interface KunjunganState {
  kunjunganList: Kunjungan[]
  filterBulan: string
  filterTahun: string
  setKunjunganList: (list: Kunjungan[]) => void
  setFilterBulan: (bulan: string) => void
  setFilterTahun: (tahun: string) => void
}

export const useKunjunganStore = create<KunjunganState>((set) => ({
  kunjunganList: [],
  filterBulan: '',
  filterTahun: '',
  setKunjunganList: (list: Kunjungan[]) => set({ kunjunganList: list }),
  setFilterBulan: (bulan: string) => set({ filterBulan: bulan }),
  setFilterTahun: (tahun: string) => set({ filterTahun: tahun }),
}))
