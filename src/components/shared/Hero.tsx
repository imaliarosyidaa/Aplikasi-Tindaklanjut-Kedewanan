import { MinimalistHero } from '@/components/ui/minimalist-hero'
import { Link } from '@/routing'

interface HeroProps {
  title?: string
  highlight?: string
  subtitle?: string
  badge?: string
}

export default function Hero({ title, highlight, subtitle, badge }: HeroProps) {
  return (
    <MinimalistHero
      logoText="DPRD DKI Jakarta"
      navLinks={[
        { label: 'HOME', href: '/' },
        { label: 'LAPORAN', href: '/laporan-saya' },
        { label: 'PENGAJUAN', href: '/#pengajuan' },
      ]}
      mainText={
        subtitle ??
        'Portal resmi penyampaian aspirasi masyarakat kepada DPRD DKI Jakarta. Sampaikan usulan, pengaduan, maupun apresiasi secara mudah, transparan, dan dapat dipantau perkembangannya.'
      }
      readMoreLink="/#about"
      imageSrc="/yuke_yurike.png"
      imageAlt="Yuke Yurike - Anggota DPRD"
      overlayText={{
        part1: title ?? 'Sampaikan',
        part2: highlight ?? 'Aspirasi Anda',
      }}
      socialLinks={[]}
      locationText="DPRD DKI Jakarta"
    />
  )
}
