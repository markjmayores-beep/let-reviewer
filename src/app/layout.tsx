import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'LET Reviewer PH — Pass the Licensure Exam for Teachers',
    template: '%s | LET Reviewer PH',
  },
  description:
    'The most comprehensive LET reviewer in the Philippines. 5,000+ questions, mock board exams, real-time analytics, and gamified learning. Trusted by thousands of teacher board exam passers.',
  keywords: [
    'LET reviewer',
    'Licensure Examination for Teachers',
    'LET 2026',
    'board exam reviewer Philippines',
    'professional education reviewer',
    'elementary LET reviewer',
    'secondary LET reviewer',
    'mock board exam',
    'teacher licensure Philippines',
  ],
  authors: [{ name: 'LET Reviewer PH' }],
  creator: 'LET Reviewer PH',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://letreviewer.ph'),
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    title: 'LET Reviewer PH — Pass the Licensure Exam for Teachers',
    description: 'Smart, gamified LET reviewer. 5,000+ questions, AI-powered weak topic detection, mock board exams.',
    siteName: 'LET Reviewer PH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LET Reviewer PH',
    description: 'Pass the LET on your first try. Smart reviewer with 5,000+ questions.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full bg-white text-slate-900 antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', background: '#1e293b', color: '#fff' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
