import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AnimateIn from '@/components/ui/AnimateIn'

export default function FooterCTA() {
  return (
    <section className="bg-teal-600 py-20">
      <div className="content-container text-center">
        <AnimateIn>
          {/* Eyebrow */}
          <span className="inline-block text-xs font-semibold tracking-widest uppercase
                           bg-white/15 text-white px-3 py-1.5 rounded-full mb-6">
            Start Today
          </span>

          {/* Headline */}
          <h2 className="font-serif font-bold text-white text-4xl lg:text-5xl
                         leading-tight mb-5 max-w-2xl mx-auto">
            One conversation can change your child&apos;s future.
          </h2>

          {/* Body */}
          <p className="text-teal-100 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Tell us about your child and your goals. We&apos;ll listen, build a plan around them,
            and show you exactly what personalized education can look like — no pressure,
            no obligation.
          </p>

          {/* CTA pair */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50
                         text-teal-700 font-bold text-base px-8 py-4 rounded-full
                         shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Schedule Your Free Consultation
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 border-2 border-white/40
                         hover:border-white text-white font-bold text-base px-8 py-4
                         rounded-full transition-all duration-200 hover:bg-white/10"
            >
              Explore Programs
            </Link>
          </div>

          {/* Reassurance */}
          <p className="mt-6 text-teal-200 text-sm">
            No obligation &nbsp;·&nbsp; We reply within 24 hours &nbsp;·&nbsp; Nationwide service
          </p>
        </AnimateIn>
      </div>
    </section>
  )
}
