'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { signIn } from 'next-auth/react'
import { useRouter } from '@/routing'
import { MdDirectionsWalk } from 'react-icons/md'
export default function LoginPage(): React.ReactNode {
  const t = useTranslations('Auth')
  const c = useTranslations('Common')
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/Lambang_DPRD_Generik.png" alt="Logo" className="h-24 w-auto" />
            <img src="/Lambang_Partai_Demokrasi_Indonesia_Perjuangan.svg.png" alt="Logo Text" className="h-24 w-auto" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">
            {t('login')}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {c('appName')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? c('loading') : t('login')}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <a href='/' className="text-sm text-[var(--color-primary)] hover:underline">
            {t('visitorLogin')}
          </a>
        </div>
      </Card>
    </div>
  )
}
