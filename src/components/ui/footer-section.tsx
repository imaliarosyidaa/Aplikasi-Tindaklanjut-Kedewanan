"use client"

import * as React from "react"
import Link from "next/link"
import { MapPin, Mail, Phone, Send, Sun, Moon } from "lucide-react"
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube, FaTiktok } from "react-icons/fa6"
import { SiLinktree } from "react-icons/si"
import { cn } from "@/lib/utils"

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/share/1KdHQpdz7S/", Icon: FaFacebookF },
  { name: "Instagram", href: "https://www.instagram.com/yukeyurike", Icon: FaInstagram },
  { name: "X (Twitter)", href: "https://x.com/yukeyurike", Icon: FaXTwitter },
  { name: "YouTube", href: "https://www.youtube.com/@YUKTV", Icon: FaYoutube },
  { name: "TikTok", href: "https://www.tiktok.com/@yukerjaa", Icon: FaTiktok },
  { name: "Linktree", href: "https://linktr.ee/yukerjaa", Icon: SiLinktree },
]

function Footerdemo() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Hak Cipta */}
          <div className="relative">
            <div className="flex items-center gap-4">
              <img src="/Lambang_DPRD_Generik.png" alt="Logo DPRD" className="h-24 w-auto" />
              <img
                src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png"
                alt="Logo PDIP"
                className="h-24 w-auto"
              />
            </div>
            <p className="mt-6 text-muted-foreground leading-7">
              © {new Date().getFullYear()} DPRD Provinsi DKI Jakarta.
              <br />
              Semua hak dilindungi.
            </p>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>

          {/* Tautan Cepat */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Tautan Cepat</h3>
            <nav className="space-y-2 text-sm">
              <Link href="/" className="block transition-colors hover:text-primary">
                Beranda
              </Link>
              <Link href="/pengajuan" className="block transition-colors hover:text-primary">
                Pengajuan Aspirasi
              </Link>
              <Link href="/laporan" className="block transition-colors hover:text-primary">
                Laporan Saya
              </Link>
              <Link href="/faq" className="block transition-colors hover:text-primary">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Informasi</h3>
            <address className="space-y-2 text-sm not-italic">
              <li className="flex gap-3 list-none">
                <MapPin className="mt-1 shrink-0" size={18} />
                <span>
                  Jl. Kebon Sirih No.18, Lantai 8 Ruang Fraksi PDI Perjuangan
                  <br />
                  Jakarta Pusat
                </span>
              </li>
              <li className="flex items-center gap-3 list-none">
                <Phone size={18} />
                08131007075
              </li>
              <li className="flex items-center gap-3 list-none">
                <Mail size={18} />
                aspirasi.yukerja@gmail.com
              </li>
            </address>
          </div>

          {/* Ikuti Kami */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Ikuti Kami</h3>
            <div className="mb-6 flex space-x-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  <item.Icon className="h-4 w-4" />
                  <span className="sr-only">{item.name}</span>
                </a>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsDarkMode(false)}
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                  !isDarkMode ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={cn(
                  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isDarkMode ? "bg-primary" : "bg-input"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                    isDarkMode ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
              <button
                type="button"
                onClick={() => setIsDarkMode(true)}
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                  isDarkMode ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            Dibuat dengan ❤️ untuk pelayanan masyarakat.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link href="#" className="transition-colors hover:text-primary">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Syarat & Ketentuan
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
