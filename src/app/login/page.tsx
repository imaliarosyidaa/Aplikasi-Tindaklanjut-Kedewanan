'use client'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useRouter } from '@/routing'
import { MdVisibility, MdVisibilityOff, MdError } from 'react-icons/md'

export default function LoginPage(): React.ReactNode {
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

    try {
      const csrfRes = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfRes.json()

      const formBody = new URLSearchParams({
        email,
        password,
        csrfToken,
        callbackUrl: '/admin/dashboard',
        json: 'true',
      })

      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      })

      if (res.ok || res.status === 302) {
        router.push('/admin/dashboard')
      } else {
        setError('Email atau kata sandi salah')
        setLoading(false)
      }
    } catch (_) {
      setError('Email atau kata sandi salah')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between overflow-hidden bg-[url('/gedung_dprd.png')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-300 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-5 p-10">
          <img src="/Lambang_DPRD_Generik.png" alt="Logo DPRD" className="h-20 w-auto drop-shadow-lg" />
          <img src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png" alt="Logo PDI Perjuangan" className="h-20 w-auto drop-shadow-lg" />
        </div>
        <div className="relative z-10 p-10 bg-gradient-to-t from-black pl-8 pb-8 pr-[25%]">
          <p className="text-4xl font-bold leading-tight text-white lg:text-5xl">
            Aplikasi Koordinasi
            <br />
            Tindak Lanjut
            <br />
            Kedewanan
          </p>
          <p className="mt-4 text-lg text-blue-200">
            DPRD DKI Jakarta
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <img src="/Lambang_DPRD_Generik.png" alt="Logo DPRD" className="mx-auto h-16 w-auto" />
            <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">
              Aplikasi Koordinasi Tindak Lanjut Kedewanan
            </h1>
          </div>

          <div className="hidden lg:block text-center">
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              Selamat Datang
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Masuk untuk melanjutkan ke dashboard
            </p>
          </div>

          <div className="px-8">
            <form onSubmit={handleSubmit} method="post" className="space-y-5">
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 pr-11 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <MdError size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>
          </div>

          <div className="text-center">
            <a
              href="/"
              className="text-sm text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)] hover:underline"
            >
              Masuk sebagai Pengunjung
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
