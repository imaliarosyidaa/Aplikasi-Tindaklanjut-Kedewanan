'use client'

import useSWR from 'swr'
import type { DashboardStats } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    '/api/dashboard',
    fetcher
  )
  return { data, error, isLoading }
}
