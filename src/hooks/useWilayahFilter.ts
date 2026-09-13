'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  isKotaActive,
  isKecamatanActive,
  setKotaFlag as saveKotaFlag,
  setKecamatanFlag as saveKecamatanFlag,
} from '@/utils/wilayah-config'

export function useKotaFlag(id: string, dbFlag: boolean) {
  const [localVersion, setLocalVersion] = useState(0)

  const active = isKotaActive(id)

  const toggle = useCallback(() => {
    saveKotaFlag(id, !active)
    setLocalVersion((v) => v + 1)
  }, [id, active])

  return { active, toggle, dbFlag }
}

export function useKecamatanFlag(id: string, dbFlag: boolean) {
  const [localVersion, setLocalVersion] = useState(0)

  const active = isKecamatanActive(id)

  const toggle = useCallback(() => {
    saveKecamatanFlag(id, !active)
    setLocalVersion((v) => v + 1)
  }, [id, active])

  return { active, toggle, dbFlag }
}
