'use client'

import useSWR from 'swr'
import type { Kegiatan } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useKegiatanByKelurahan(kelurahan: string | null) {
  const url = kelurahan ? `/api/kegiatan?kelurahan=${encodeURIComponent(kelurahan)}` : null
  return useSWR<Kegiatan[]>(url, fetcher)
}

export function useKegiatanByKecataman(kecamatan: string | null) {
  const url = kecamatan ? `/api/kegiatan?kecamatan=${encodeURIComponent(kecamatan)}` : null
  return useSWR<Kegiatan[]>(url, fetcher)
}

export function useKegiatan(id: string) {
  return useSWR<Kegiatan>(`/api/kegiatan/${id}`, fetcher)
}

export function useKegiatanAll() {
  return useSWR<Kegiatan>(`/api/kegiatan`, fetcher)
}

export function useKecamatanAll() {
  return useSWR<Kegiatan>(`/api/kecamatan`, fetcher)
}
