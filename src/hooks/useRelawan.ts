'use client'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { Relawan } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useRelawanList() {
  return useSWR<Relawan[]>('/api/relawan', fetcher)
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
