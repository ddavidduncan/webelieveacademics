import type { Metadata } from 'next'
import Hero            from '@/components/home/Hero'
import TrustBar        from '@/components/home/TrustBar'
import WhyWeBelieve    from '@/components/home/WhyWeBelieve'
import ProgramsTeaser  from '@/components/home/ProgramsTeaser'
import HowItWorksTeaser from '@/components/home/HowItWorksTeaser'
import Testimonials    from '@/components/home/Testimonials'
import FooterCTA       from '@/components/home/FooterCTA'

export const metadata: Metadata = {
  title: 'We Believe Academics | AI-Powered Curriculum + Real Private Teachers',
  description:
    'We Believe Academics combines advanced AI with real, caring private teachers to create a living, personalized K–12 curriculum. Schedule your free consultation today.',
}

export default function HomePage() {
  return (
    <>
      {/* 1 — Hero: headline, brand copy, CTAs, logo */}
      <Hero />

      {/* 2 — Trust signals strip */}
      <TrustBar />

      {/* 3 — Why We Believe: 3 pillars */}
      <WhyWeBelieve />

      {/* 4 — Programs teaser: 4 cards */}
      <ProgramsTeaser />

      {/* 5 — How It Works teaser: 5 steps */}
      <HowItWorksTeaser />

      {/* 6 — Testimonials */}
      <Testimonials />

      {/* 7 — Footer CTA band */}
      <FooterCTA />
    </>
  )
}
