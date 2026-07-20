'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { Aspirasi, AspirasiStatus } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AspirasiListParams {
  page?: number
  limit?: number
  search?: string
  sumber?: string
  status?: string
  kota?: string
  kecamatan?: string
  kelurahan?: string
}

export function useAspirasiList(params?: AspirasiListParams) {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
        )
      ).toString()
    : ''

  const { data, error, isLoading, mutate } = useSWR<Aspirasi[] | { data: Aspirasi[]; total: number }>(
    `/api/aspirasi${qs}`,
    fetcher
  )

  if (params) {
    const paginated = data as { data: Aspirasi[]; total: number } | undefined
    return {
      data: paginated?.data ?? [],
      total: paginated?.total ?? 0,
      error,
      isLoading,
      mutate,
    }
  }

  return { data: (data as Aspirasi[]) ?? [], total: 0, error, isLoading, mutate }
}

export function useAspirasi(id: string) {
  const { data, error, isLoading } = useSWR<Aspirasi>(
    id ? `/api/aspirasi/${id}` : null,
    fetcher
  )
  return { data, error, isLoading }
}

interface UpdateStatusPayload {
  status: AspirasiStatus
  catatan?: string
  lampiran?: string[]
  kirim_email?: boolean
  kirim_telepon?: boolean
  pelapor_email?: string
  pelapor_telepon?: string
}

export function useUpdateStatus(id: string) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/aspirasi/${id}`,
    (url, { arg }: { arg: UpdateStatusPayload }) =>
      fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      }).then((res) => res.json())
  )
  return { trigger, isMutating }
}
