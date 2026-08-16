'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useDprd() {
  return useSWR(`/api/dprd`, fetcher)
}
