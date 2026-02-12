// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MiM Sampana Manager',
  description: 'Fitantanana Fandaharam-potoana sy Fanasana — MiM 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mg">
      <body>{children}</body>
    </html>
  )
}
