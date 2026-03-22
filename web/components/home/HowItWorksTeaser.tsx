import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimateIn from '@/components/ui/AnimateIn'

const steps = [
  { n: '01', title: 'Free Consultation',   blurb: 'We listen to your goals and your child\'s story.'                           },
  { n: '02', title: 'AI Curriculum Build', blurb: 'Our technology creates a unique learning plan in minutes.'                 },
  { n: '03', title: 'Teacher Matching',    blurb: 'We hand-match you with an amazing private teacher.'                        },
  { n: '04', title: 'Learning Begins',     blurb: 'Weekly sessions (in-home, online, or hybrid) with real-time AI support.'  },
  { n: '05', title: 'Ongoing Progress',    blurb: 'Monthly reports + adjustments so your child keeps thriving.'               },
]

export default function HowItWorksTeaser() {
  return (
    <section className="section-pad bg-white">
      <div className="content-container">

        <AnimateIn className="flex flex-col sm:flex-row items-start sm:items-end
                              justify-between gap-6 mb-14">
          <SectionHeader
            eyebrow="How It Works"
            heading="Simple. Personalized. Life-Changing."
            body="Getting started is easy — we walk alongside your family every step of the way."
            align="left"
            className="max-w-xl"
          />
          <Link
            href="/how-it-works"
            className="flex-shrink-0 inline-flex items-center gap-2 text-teal-600 font-bold
                       text-sm hover:text-teal-700 transition-colors group"
          >
            See full process
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimateIn>

        {/* Steps — horizontal flow on desktop, stacked on mobile */}
        <div className="relative">

          {/* Connecting dashed line (desktop only) */}
          <div className="hidden lg:block absolute top-7 left-0 right-0 h-px border-t-2
                          border-dashed border-teal-200 mx-14 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map(({ n, title, blurb }, i) => (
              <AnimateIn key={n} delay={i * 100}>
                <div className="flex flex-col items-center text-center group">
                  {/* Number badge */}
                  <div className="w-14 h-14 rounded-full bg-blue-900 text-white flex items-center
                                  justify-center font-bold text-sm mb-4 shadow-md
                                  group-hover:bg-teal-600 transition-colors duration-300
                                  ring-4 ring-white">
                    {n}
                  </div>
                  <h3 className="font-serif font-bold text-blue-900 text-base mb-2 leading-tight">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{blurb}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>

        {/* CTA */}
        <AnimateIn className="text-center mt-14">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600
                       text-white font-bold px-8 py-4 rounded-full shadow-btn
                       hover:shadow-btn-hover transition-all duration-200 hover:-translate-y-0.5"
          >
            Schedule Your Free Consultation
            <ArrowRight size={18} />
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}
