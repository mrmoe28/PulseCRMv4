import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { TrpcProvider } from '../providers'
import { AuthProvider } from '../providers/auth-provider'
import { DebugPanel } from '../components/debug/DebugPanel'
import './error-filter'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'PulseCRM - Crew Management Dashboard',
    template: '%s | PulseCRM'
  },
  description: 'Modern React-based CRM dashboard for crew management with intelligent interfaces and advanced collaboration tools',
  keywords: ['CRM', 'crew management', 'dashboard', 'construction', 'project management'],
  authors: [{ name: 'PulseCRM Team' }],
  creator: 'PulseCRM',
  publisher: 'PulseCRM',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'PulseCRM',
    title: 'PulseCRM - Crew Management Dashboard',
    description: 'Modern React-based CRM dashboard for crew management',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PulseCRM Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulseCRM - Crew Management Dashboard',
    description: 'Modern React-based CRM dashboard for crew management',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#ea580c' },
  ],
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <TrpcProvider>
              {children}
            </TrpcProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
        <DebugPanel />
      </body>
    </html>
  )
}
