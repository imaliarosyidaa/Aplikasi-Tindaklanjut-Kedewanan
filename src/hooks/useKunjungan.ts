'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { Kunjungan } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useKunjunganList() {
  const { data, error, isLoading, mutate } = useSWR<Kunjungan[]>(
    '/api/kunjungan',
    fetcher
  )
  return { data: data ?? [], error, isLoading, mutate }
}

export function useCreateKunjungan() {
  const { trigger, isMutating } = useSWRMutation(
    '/api/kunjungan',
    (url, { arg }: { arg: Omit<Kunjungan, 'id' | 'created_at' | 'updated_at'> }) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      }).then((res) => res.json())
  )
  return { trigger, isMutating }
}
