'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { signIn } from 'next-auth/react'
import { useRouter } from '@/routing'
import { MdDirectionsWalk, MdVisibility, MdVisibilityOff } from 'react-icons/md'
export default function LoginPage(): React.ReactNode {
  const t = useTranslations('Auth')
  const c = useTranslations('Common')
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(t('loginError'))
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="w-full h-screen flex flex-row text-[#34364A]">
      <div
        id="Banner"
        className="w-1/2 bg-[url('/gedung_dprd.png')] bg-cover bg-center bg-no-repeat text-white flex flex-col justify-between font-sans"
      >
        <div className="px-8 pt-8 flex flex-row gap-x-4 items-center">
          <img src="/Lambang_DPRD_Generik.png" alt="Logo" className="h-24 w-auto" />
            <img src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png" alt="Logo Text" className="h-24 w-auto" />
        </div>
        <div className="bg-gradient-to-t from-black pl-8 pb-8 pr-[25%]">
          <p className="text-6xl mb-6 font-medium leading-[75px] tracking-wide">Aplikasi Tindak Lanjut Kedewanan</p>
          <p className="text-md text-slate-400">Sistem untuk mengelola dan melacak aspirasi masyarakat</p>
        </div>
      </div>
      <div className="w-1/2 flex flex-col justify-center items-center">
        <h1 className="text-center mb-8 text-3xl font-bold"><span className="text-xl">Selamat Datang! </span><br />Aplikasi Tindak Lanjut Kedewanan</h1>
        <div id="Forms" className="flex flex-col gap-y-6 text-center w-1/2">
          <form onSubmit={handleSubmit} className="text-left font-medium flex flex-col gap-[16px]">
            <div className="flex flex-col">
              <label className="mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded-md border-gray-400 hover:border-black focus:border-black p-[8px_10px]"
                name="email"
                placeholder="Masukan email"
                required />
            </div>

            <div className="flex flex-col">
              <label className="mb-2" htmlFor="password">Password</label>
              <div className="relative w-full rounded-md border border-gray-300 transition-colors duration-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full rounded-md bg-transparent px-3 py-2.5 pr-11 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="cursor-pointer bg-gray-100 rounded-md absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 transition-colors hover:text-black"
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>
          {error && (
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          )}
            <button type="submit" className=" cursor-pointer text-center text-white p-[8px_10px] w-full bg-blue-700 rounded-md" disabled={loading}>
              {loading ? c('loading') : t('login')}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href='/' className="cursor-pointertext-sm text-[var(--color-primary)] hover:underline">
            {t('visitorLogin')}
          </a>
        </div>
        </div>
      </div>
    </div>
  )
}
