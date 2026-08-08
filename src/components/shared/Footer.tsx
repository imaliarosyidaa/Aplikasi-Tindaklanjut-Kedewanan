import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Mail, Phone } from 'lucide-react'

import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube, FaTiktok } from 'react-icons/fa6'
import { SiLinktree } from 'react-icons/si'

export default function Footer() {
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1KdHQpdz7S/',
      icon: <FaFacebookF size={18} />,
      hoverClass: 'hover:bg-blue-600 hover:border-blue-600',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/yukeyurike',
      icon: <FaInstagram size={18} />,
      hoverClass: 'hover:bg-pink-600 hover:border-pink-600',
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com/yukeyurike',
      icon: <FaXTwitter size={18} />,
      hoverClass: 'hover:bg-black hover:border-black dark:hover:bg-white dark:hover:text-black',
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@YUKTV',
      icon: <FaYoutube size={18} />,
      hoverClass: 'hover:bg-red-600 hover:border-red-600',
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@yukerjaa',
      icon: <FaTiktok size={18} />,
      hoverClass: 'hover:bg-black hover:border-black',
    },
    {
      name: 'Linktree',
      href: 'https://linktr.ee/yukerjaa',
      icon: <SiLinktree size={18} />,
      hoverClass: 'hover:bg-emerald-600 hover:border-emerald-600',
    },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-blue-100 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-purple-200 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-200 blur-3xl" />
      </div>

      <div className="container mx-auto pt-14">
        <div className="grid gap-12 lg:grid-cols-4 px-6">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-4">
              <img src="/Lambang_DPRD_Generik.png" alt="Logo" className="h-24 w-auto" />
              <img
                src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png"
                alt="Logo Text"
                className="h-24 w-auto"
              />
            </div>
            <p className="mt-6 text-gray-500 leading-7">
              © {new Date().getFullYear()} DPRD Provinsi DKI Jakarta.
              <br />
              Semua hak dilindungi.
            </p>
          </div>
          {/* Menu */}
          <div>
            <h4 className="font-semibold mb-5">Tautan Cepat</h4>
            <ul className="space-y-3 text-gray-500">
              <li>
                <Link href="/">Beranda</Link>
              </li>
              <li>
                <Link href="/pengajuan">Pengajuan Aspirasi</Link>
              </li>
              <li>
                <Link href="/laporan">Laporan Saya</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
            </ul>
          </div>
          {/* Informasi */}
          <div>
            <h4 className="font-semibold mb-5">Informasi</h4>
            <ul className="space-y-4 text-gray-500">
              <li className="flex gap-3">
                <MapPin className="mt-1 shrink-0" size={18} />
                <span>
                  Jl. Kebon Sirih No.18, Lantai 8 Ruang Fraksi PDI Perjuangan
                  <br />
                  Jakarta Pusat
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} />
                08131007075
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} />
                aspirasi.yukerja@gmail.com
              </li>
            </ul>
          </div>
          {/* Sosmed */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--color-text)]">Ikuti Kami</h4>

            {/* 🛠️ PERBAIKAN: flex-wrap + gap responsif (gap-2 sm:gap-3) & ikon h-10 w-10 di HP */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-all duration-200 hover:text-white ${item.hoverClass}`}
                >
                  {item.icon}
                </a>
              ))}
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Ikuti informasi terbaru seputar kegiatan dan aspirasi DPRD DKI Jakarta.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-blue-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">Dibuat dengan ❤️ untuk pelayanan masyarakat.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="#">Kebijakan Privasi</Link>
              <Link href="#">Syarat & Ketentuan</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
