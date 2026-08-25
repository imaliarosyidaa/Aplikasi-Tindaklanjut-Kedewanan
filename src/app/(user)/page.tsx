'use client'

import Hero from '@/components/shared/Hero'
import { Hero04 } from '@/components/ui/hero-04'
import PengajuanAspirasiPage from './pengajuan-aspirasi/page'

export default function UserHomePage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <Hero
        title="Yuke"
        highlight="Yurike"
        subtitle="Pelayanan ini khusus untuk membantu warga DKI Jakarta dalam menindaklanjuti segala laporan terhadap Pemprov DKI Jakarta."
        badge="Layanan aspirasi masyarakat terpercaya"
      />

      {/* About */}
      <Hero04
        title="Melayani Aspirasi"
        titleLine2="Masyarakat DKI Jakarta"
        description="Hj. YUKE YURIKE, S.T., M.M.  merupakan anggota DPRD Provinsi DKI Jakarta periode 2024-2029. Saat ini aktif menduduki posisi sebagai ketua KOMISI D – Bidang Pembangunan."
        primaryImage="/yuke_yurike_rapat.jpg"
        secondaryImage="/yuke_yurike_dewan.jpg"
        primaryAlt="Yuke Yurike dalam rapat"
        secondaryAlt="Yuke Yurike di DPRD"
        animation="subtle"
      />

      {/* Form Pengajuan */}
      <section id="pengajuan" className="bg-[var(--color-bg)] py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-10 text-start">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">Ajukan Aspirasi Anda Sekarang</h2>

            <p className="mt-3 text-[var(--color-text-secondary)]">
              Lengkapi formulir berikut untuk menyampaikan aspirasi atau pengaduan Anda.
            </p>
          </div>

          <PengajuanAspirasiPage />
        </div>
      </section>
    </div>
  )
}
