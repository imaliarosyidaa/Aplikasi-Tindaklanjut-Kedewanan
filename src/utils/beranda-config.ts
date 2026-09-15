export interface GalleryItem {
  id: string
  url: string
  title: string
  caption: string
}

export interface BerandaConfig {
  heroImage: string
  heroTitle: string
  heroHighlight: string
  heroSubtitle: string
  heroBadge: string
  gallery: GalleryItem[]
}

export const DEFAULT_HERO_IMAGE = '/15_DPRD_PDIP.png'

export const DEFAULT_HERO_FIELDS = {
  heroImage: '',
  heroTitle: '',
  heroHighlight: '',
  heroSubtitle: '',
  heroBadge: '',
}