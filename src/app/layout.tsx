import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={['light', 'dark', 'yellow', 'ramadan', 'valentine']}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
