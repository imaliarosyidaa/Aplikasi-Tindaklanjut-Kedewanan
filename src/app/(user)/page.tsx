'use client'

import Hero from '@/components/shared/Hero'
import PengajuanAspirasiPage from './pengajuan-aspirasi/page'

export default function UserHomePage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <Hero
        title="Sampaikan"
        highlight="Aspirasi Anda"
        subtitle="Portal resmi penyampaian aspirasi masyarakat kepada DPRD DKI Jakarta. Sampaikan usulan, pengaduan, maupun apresiasi secara mudah, transparan, dan dapat dipantau perkembangannya."
      />

      {/* Form Pengajuan */}
      <section className="bg-white py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-10 text-start">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">
              Ajukan Aspirasi Sekarang
            </h2>

            <p className="mt-3 text-[var(--color-text-secondary)]">
              Lengkapi formulir berikut untuk menyampaikan aspirasi atau
              pengaduan Anda.
            </p>
          </div>

          <PengajuanAspirasiPage />
        </div>
      </section>
    </div>
  )
}