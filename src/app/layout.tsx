import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aplikasi Tindaklanjut Kedewanan',
  description: 'Dashboard tracker kunjungan dan aspirasi DPRD Jakarta Selatan',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      </body>
    </html>
  )
}
