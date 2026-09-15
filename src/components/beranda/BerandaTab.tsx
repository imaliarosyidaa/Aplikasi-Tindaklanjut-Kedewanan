'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/ui/file-upload'
import {
  MdCheckCircle,
  MdRestartAlt,
  MdSave,
  MdHome,
  MdTextFields,
  MdCollections,
  MdDelete,
  MdArrowUpward,
  MdArrowDownward,
} from 'react-icons/md'
import { DEFAULT_HERO_IMAGE, type BerandaConfig, type GalleryItem } from '@/utils/beranda-config'

export interface GalleryFormItem {
  url: string
  title: string
  caption: string
}

export type BerandaSavePayload = Partial<Omit<BerandaConfig, 'gallery'>> & { gallery?: GalleryFormItem[] }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function BerandaTab() {
  const { data, isLoading, mutate } = useSWR<BerandaConfig>('/api/beranda-config', fetcher)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (c: BerandaSavePayload) => {
    const res = await fetch('/api/beranda-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      throw new Error(json?.error ?? `Gagal menyimpan (HTTP ${res.status})`)
    }
    await mutate()
    setError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleHeroReset = () => {
    if (!window.confirm('Kembalikan pengaturan hero beranda ke default?')) return
    handleSave({
      heroImage: '',
      heroTitle: '',
      heroHighlight: '',
      heroSubtitle: '',
      heroBadge: '',
    }).catch((e) => setError(e instanceof Error ? e.message : 'Gagal reset hero'))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <MdHome size={20} />
            Pengaturan Beranda
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Ubah gambar, narasi hero, dan galeri kegiatan pada halaman beranda.
          </p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <MdCheckCircle size={16} />
            Berhasil disimpan
          </span>
        )}
        {error && <span className="text-sm text-[var(--color-danger)]">{error}</span>}
      </div>

      {isLoading || !data ? (
        <Card className="p-6">
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        </Card>
      ) : (
        <>
          <HeroForm initial={data} onSave={handleSave} onReset={handleHeroReset} />
          <GalleryForm initial={data.gallery ?? []} onSave={(gallery) => handleSave({ gallery })} />
        </>
      )}
    </div>
  )
}

function HeroForm({
  initial,
  onSave,
  onReset,
}: {
  initial: BerandaConfig
  onSave: (c: BerandaSavePayload) => Promise<void>
  onReset: () => void
}) {
  const [heroImage, setHeroImage] = useState(initial.heroImage ?? '')
  const [heroTitle, setHeroTitle] = useState(initial.heroTitle ?? '')
  const [heroHighlight, setHeroHighlight] = useState(initial.heroHighlight ?? '')
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle ?? '')
  const [heroBadge, setHeroBadge] = useState(initial.heroBadge ?? '')

  const previewSrc = heroImage.trim() || DEFAULT_HERO_IMAGE

  const submit = () =>
    onSave({
      heroImage: heroImage.trim(),
      heroTitle: heroTitle.trim(),
      heroHighlight: heroHighlight.trim(),
      heroSubtitle: heroSubtitle.trim(),
      heroBadge: heroBadge.trim(),
    })

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom kiri: gambar hero */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <MdTextFields size={16} />
            Ubah Hero (Gambar)
          </h3>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">Pratinjau</p>
            <img
              src={previewSrc}
              alt="Hero beranda"
              className="aspect-video w-full max-w-md rounded-lg object-cover shadow ring-1 ring-black/10"
            />
          </div>

          <FileUpload
            label="Gambar Hero Baru"
            maxFiles={1}
            maxSizeMB={5}
            multiple={false}
            acceptedTypes=".jpg,.jpeg,.png,.webp"
            value={heroImage ? [heroImage] : []}
            onChange={(urls) => {
              if (urls.length > 0) setHeroImage(urls[0])
            }}
          />
        </div>

        {/* Kolom kanan: narasi hero */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <MdTextFields size={16} />
            Ubah Narasi Hero
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <Input
              id="hero-title"
              label="Judul"
              placeholder="Sampaikan"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
            />
            <Input
              id="hero-highlight"
              label="Teks Sorotan (Highlight)"
              placeholder="Aspirasi Anda"
              value={heroHighlight}
              onChange={(e) => setHeroHighlight(e.target.value)}
            />
            <Input
              id="hero-subtitle"
              label="Narasi / Deskripsi"
              placeholder="Portal resmi penyampaian aspirasi..."
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
            />
            <Input
              id="hero-badge"
              label="Badge"
              placeholder="Layanan aspirasi masyarakat terpercaya"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              onClick={() => submit().catch(() => undefined)}
              className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
            >
              <MdSave size={16} />
              Simpan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="flex items-center gap-2 text-[var(--color-text-secondary)]"
            >
              <MdRestartAlt size={16} />
              Reset ke Default
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface GalleryDraft {
  key: string
  url: string
  title: string
  caption: string
}

function GalleryForm({
  initial,
  onSave,
}: {
  initial: GalleryItem[]
  onSave: (gallery: GalleryFormItem[]) => Promise<void>
}) {
  const [items, setItems] = useState<GalleryDraft[]>(() =>
    initial.map((g) => ({ key: g.id, url: g.url, title: g.title, caption: g.caption })),
  )
  const [saving, setSaving] = useState(false)

  const newKey = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `g-${Date.now()}-${Math.random()}`

  const addFiles = (urls: string[]) => {
    if (urls.length === 0) return
    setItems((prev) => [...prev, ...urls.map((url) => ({ key: newKey(), url, title: '', caption: '' }))])
  }

  const updateItem = (key: string, patch: Partial<Pick<GalleryDraft, 'title' | 'caption' | 'url'>>) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  const moveItem = (key: string, dir: -1 | 1) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.key === key)
      const target = index + dir
      if (index < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      await onSave(items.map(({ url, title, caption }) => ({ url, title, caption })))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <MdCollections size={16} />
            Galeri Kegiatan
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Unggah foto dan atur judul serta keterangan untuk setiap foto galeri.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] text-center border border-dashed border-[var(--color-border)] rounded-lg py-8">
            Belum ada foto galeri. Unggah foto melalui tombol di bawah.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.key}
                className="flex flex-col sm:flex-row gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"
              >
                <img
                  src={item.url}
                  alt={item.title || 'Foto galeri'}
                  className="h-24 w-full sm:w-32 rounded-lg object-cover ring-1 ring-black/10 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-3">
                  <Input
                    id={`gallery-title-${item.key}`}
                    label="Judul"
                    value={item.title}
                    placeholder="contoh: Reses Kecamatan"
                    onChange={(e) => updateItem(item.key, { title: e.target.value })}
                  />
                  <Input
                    id={`gallery-caption-${item.key}`}
                    label="Keterangan / Caption"
                    value={item.caption}
                    placeholder="Deskripsi singkat foto"
                    onChange={(e) => updateItem(item.key, { caption: e.target.value })}
                  />
                </div>

                <div className="flex sm:flex-col items-center sm:justify-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(item.key, -1)}
                    disabled={index === 0}
                    className="cursor-pointer p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Naik"
                  >
                    <MdArrowUpward size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(item.key, 1)}
                    disabled={index === items.length - 1}
                    className="cursor-pointer p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Turun"
                  >
                    <MdArrowDownward size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="cursor-pointer p-1.5 rounded-lg text-[var(--color-danger)] hover:bg-[var(--color-bg)]"
                    title="Hapus foto"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <FileUpload
          label="Tambah Foto Galeri"
          maxFiles={10}
          maxSizeMB={10}
          multiple
          acceptedTypes=".jpg,.jpeg,.png,.webp"
          value={[]}
          onChange={addFiles}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <MdSave size={16} />
                Simpan Galeri
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}