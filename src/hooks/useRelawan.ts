'use client'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { Relawan } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface RelawanListParams {
  page?: number
  limit?: number
  search?: string
}

export function useRelawanList(params?: RelawanListParams) {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
        )
      ).toString()
    : ''

  const { data, error, isLoading, mutate } = useSWR<Relawan[] | { data: Relawan[]; total: number }>(
    `/api/relawan${qs}`,
    fetcher
  )

  if (params) {
    const paginated = data as { data: Relawan[]; total: number } | undefined
    return {
      data: paginated?.data ?? [],
      total: paginated?.total ?? 0,
      error,
      isLoading,
      mutate,
    }
  }

  return { data: (data as Relawan[]) ?? [], total: 0, error, isLoading, mutate }
}

export function useCreateRelawan() {
  const { trigger, isMutating } = useSWRMutation(
    '/api/relawan',
    (url, { arg }: { arg: Omit<Relawan, 'id' | 'created_at' | 'updated_at'> }) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      }).then((r) => r.json())
  )
  return { trigger, isMutating }
}
