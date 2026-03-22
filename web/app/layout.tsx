import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Google Fonts (self-hosted by Next.js for performance) ── */
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

/* ── Site-wide SEO metadata ── */
export const metadata: Metadata = {
  title: {
    default: 'We Believe Academics | AI-Powered Curriculum + Real Private Teachers',
    template: '%s | We Believe Academics',
  },
  description:
    'We Believe Academics combines advanced AI to instantly create a personalized curriculum with real, caring private teachers. K–12 tutoring, homeschool, test prep & executive function coaching — nationwide.',
  keywords: [
    'private tutoring',
    'personalized learning',
    'AI curriculum',
    'homeschool',
    'test prep',
    'K-12 tutoring',
    'executive function coaching',
    'online tutoring',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://webelieveacademics.com',
    siteName: 'We Believe Academics',
    title: 'We Believe Academics | AI-Powered Curriculum + Real Private Teachers',
    description:
      'The perfect blend of AI precision + human heart. Personalized K–12 tutoring, homeschool programs, test prep, and more — nationwide.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'We Believe Academics',
    description: 'AI-Assisted. Real-Person Guided. Extraordinary Results.',
  },
  metadataBase: new URL('https://webelieveacademics.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        {/* Sticky top navigation */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Site footer */}
        <Footer />
      </body>
    </html>
  )
}
