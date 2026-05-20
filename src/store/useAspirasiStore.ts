import { create } from 'zustand'
import type { Aspirasi, AspirasiStatus } from '@/types'

interface AspirasiState {
  aspirasiList: Aspirasi[]
  selectedAspirasi: Aspirasi | null
  filterStatus: AspirasiStatus | 'ALL'
  filterBulan: string
  filterTahun: string
  setAspirasiList: (list: Aspirasi[]) => void
  setSelectedAspirasi: (aspirasi: Aspirasi | null) => void
  setFilterStatus: (status: AspirasiStatus | 'ALL') => void
  setFilterBulan: (bulan: string) => void
  setFilterTahun: (tahun: string) => void
}

export const useAspirasiStore = create<AspirasiState>((set) => ({
  aspirasiList: [],
  selectedAspirasi: null,
  filterStatus: 'ALL',
  filterBulan: '',
  filterTahun: '',
  setAspirasiList: (list: Aspirasi[]) => set({ aspirasiList: list }),
  setSelectedAspirasi: (aspirasi: Aspirasi | null) =>
    set({ selectedAspirasi: aspirasi }),
  setFilterStatus: (status: AspirasiStatus | 'ALL') =>
    set({ filterStatus: status }),
  setFilterBulan: (bulan: string) => set({ filterBulan: bulan }),
  setFilterTahun: (tahun: string) => set({ filterTahun: tahun }),
}))
