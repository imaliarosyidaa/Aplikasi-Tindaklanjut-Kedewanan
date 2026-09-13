const STORAGE_KEY = 'wilayah_lokal_config'

interface WilayahLokalConfig {
  kota: Record<string, boolean>
  kecamatan: Record<string, boolean>
}

function readConfig(): WilayahLokalConfig {
  if (typeof window === 'undefined') return { kota: {}, kecamatan: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { kota: {}, kecamatan: {} }
    const parsed = JSON.parse(raw)
    return { kota: parsed?.kota ?? {}, kecamatan: parsed?.kecamatan ?? {} }
  } catch {
    return { kota: {}, kecamatan: {} }
  }
}

function writeConfig(config: WilayahLokalConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function isKotaActive(id: string): boolean {
  return readConfig().kota[id] !== false
}

export function isKecamatanActive(id: string): boolean {
  return readConfig().kecamatan[id] !== false
}

export function setKotaFlag(id: string, active: boolean) {
  const config = readConfig()
  if (active) {
    delete config.kota[id]
  } else {
    config.kota[id] = false
  }
  writeConfig(config)
}

export function setKecamatanFlag(id: string, active: boolean) {
  const config = readConfig()
  if (active) {
    delete config.kecamatan[id]
  } else {
    config.kecamatan[id] = false
  }
  writeConfig(config)
}
