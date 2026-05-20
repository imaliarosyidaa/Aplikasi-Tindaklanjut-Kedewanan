'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { Aspirasi, AspirasiStatus, SumberAspirasi } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAspirasiList() {
  const { data, error, isLoading, mutate } = useSWR<Aspirasi[]>(
    '/api/aspirasi',
    fetcher
  )
  return { data: data ?? [], error, isLoading, mutate }
}

export function useAspirasi(id: string) {
  const { data, error, isLoading } = useSWR<Aspirasi>(
    id ? `/api/aspirasi/${id}` : null,
    fetcher
  )
  return { data, error, isLoading }
}

interface CreateAspirasiPayload {
  sumber: SumberAspirasi
  deskripsi: string
  pelapor_nama: string
  pelapor_email: string
  pelapor_telepon: string
  lampiran?: string[]
}

export function useCreateAspirasi() {
  const { trigger, isMutating } = useSWRMutation(
    '/api/aspirasi',
    (url, { arg }: { arg: CreateAspirasiPayload }) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      }).then((res) => res.json())
  )
  return { trigger, isMutating }
}

interface UpdateStatusPayload {
  status: AspirasiStatus
  catatan_tindak_lanjut?: string
  bukti_tindak_lanjut?: string[]
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
