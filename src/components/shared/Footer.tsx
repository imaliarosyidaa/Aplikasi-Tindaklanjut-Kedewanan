import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-blue-100 bg-gradient-to-br from-blue-50 via-white to-purple-50">

      <div className="absolute inset-0 opacity-40">
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
            <img src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png" alt="Logo Text" className="h-24 w-auto" />
            </div>
            <p className="mt-6 text-gray-500 leading-7">
              © {new Date().getFullYear()} DPRD Provinsi DKI Jakarta.
              <br />
              Semua hak dilindungi.
            </p>
          </div>
          {/* Menu */}
          <div>
            <h4 className="font-semibold mb-5">
              Tautan Cepat
            </h4>
            <ul className="space-y-3 text-gray-500">
              <li>
                <Link href="/">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/pengajuan">
                  Pengajuan Aspirasi
                </Link>
              </li>
              <li>
                <Link href="/laporan">
                  Laporan Saya
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          {/* Informasi */}
          <div>
            <h4 className="font-semibold mb-5">
              Informasi
            </h4>
            <ul className="space-y-4 text-gray-500">
              <li className="flex gap-3">
                <MapPin
                  className="mt-1 shrink-0"
                  size={18}
                />
                <span>
                  Jl. Kebon Sirih No.18
                  <br />
                  Jakarta Pusat
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={18} />
                (021) 5555-1234
              </li>
              <li className="flex gap-3">
                <Mail size={18} />
                aspirasi@dprd.go.id
              </li>
            </ul>
          </div>
          {/* Sosmed */}
          <div>
            <h4 className="font-semibold mb-5">
              Ikuti Kami
            </h4>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-11 h-11 rounded-full border flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
              >
                <FaFacebook />
              </Link>
              <Link
                href="#"
                className="w-11 h-11 rounded-full border flex items-center justify-center hover:bg-pink-600 hover:text-white transition"
              >
                <FaInstagram />
              </Link>
              <Link
                href="#"
                className="w-11 h-11 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
              >
                <FaXTwitter />
              </Link>
              <Link
                href="#"
                className="w-11 h-11 rounded-full border flex items-center justify-center hover:bg-red-600 hover:text-white transition"
              >
                <FaYoutube />
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              Ikuti informasi terbaru seputar
              kegiatan dan aspirasi DPRD DKI Jakarta.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-blue-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              Dibuat dengan ❤️ untuk pelayanan masyarakat.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="#">
                Kebijakan Privasi
              </Link>
              <Link href="#">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}