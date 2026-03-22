import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="hero-bg overflow-hidden">
      <div className="content-container py-24 lg:py-32">

        {/* ── Two-column layout: copy left, visual right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 text-xs font-semibold
                            tracking-widest uppercase px-3 py-1.5 rounded-full mb-6">
              <Sparkles size={12} />
              AI-Assisted · Real-Person Guided
            </div>

            {/* H1 */}
            <h1 className="font-serif font-extrabold text-blue-900 leading-tight mb-6
                           text-4xl sm:text-5xl lg:text-[3.5rem]">
              We Believe in Every Child&apos;s{' '}
              <span className="text-teal-600">Unlimited Potential</span>
            </h1>

            {/* Subheadline */}
            <p className="text-teal-700 font-semibold text-lg mb-5 leading-snug">
              Customized Curriculum Powered by AI &bull; Delivered by Real Private Teachers
            </p>

            {/* Brand paragraph (word-for-word) */}
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl">
              At We Believe Academics, we use advanced AI to instantly create a living,
              personalized curriculum that adapts to your child&apos;s exact learning style,
              strengths, and goals. Then our expert private teachers bring it to life with
              warm, real-person guidance — keeping students deeply engaged and excited to
              learn every single day.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2
                           bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base
                           px-7 py-4 rounded-full shadow-btn hover:shadow-btn-hover
                           transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Schedule Your Free Consultation
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2
                           bg-white hover:bg-gray-50 text-blue-900 font-bold text-base
                           px-7 py-4 rounded-full border-2 border-blue-900/15
                           shadow-card hover:shadow-card-hover
                           transition-all duration-200 hover:-translate-y-0.5"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust micro-copy */}
            <p className="mt-5 text-sm text-gray-400 font-medium">
              No obligation &nbsp;·&nbsp; Nationwide &nbsp;·&nbsp; K–12 all grades &nbsp;·&nbsp; In-home, online, or hybrid
            </p>
          </div>

          {/* Right — visual card stack */}
          <div className="relative hidden lg:flex flex-col gap-4">

            {/* Main feature card */}
            <div className="card p-7">
              <div className="flex items-start gap-4 mb-5">
                {/* Logo mark */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                  <img src="/logo.svg" alt="We Believe Academics" className="w-full h-full" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
                    AI Precision + Human Heart
                  </div>
                  <h2 className="font-serif font-bold text-blue-900 text-lg leading-tight">
                    What your family actually gets
                  </h2>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'A living curriculum built around your child — not a template',
                  'A hand-matched private teacher who truly knows your child',
                  'Real progress you can see — tracked and reported monthly',
                  'Flexible scheduling: in-home, online, or hybrid nationwide',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center
                                     justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#0D9488" strokeWidth="1.8"
                              strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Three small stat pills */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '1:1',      label: 'Dedicated teacher'   },
                { value: 'Living',   label: 'Curriculum adapts'   },
                { value: 'Yours',    label: 'Full family portal'  },
              ].map(({ value, label }) => (
                <div key={value}
                  className="card p-4 text-center hover:border-teal-200">
                  <div className="font-serif font-bold text-xl text-teal-600 mb-1">{value}</div>
                  <div className="text-xs text-gray-500 font-medium leading-tight">{label}</div>
                </div>
              ))}
            </div>

            {/* Promise callout */}
            <div className="bg-blue-900 rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-2">
                Our promise
              </p>
              <p className="font-serif font-semibold text-lg leading-snug">
                AI makes the plan smarter.
                Your child&apos;s teacher makes it human.
                Your family gets both.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tagline strip ── */}
      <div className="bg-blue-900 py-4">
        <div className="content-container text-center">
          <p className="text-white font-semibold text-base tracking-wide">
            ✦&nbsp; AI-Assisted &nbsp;·&nbsp; Real-Person Guided &nbsp;·&nbsp; Extraordinary Results &nbsp;✦
          </p>
        </div>
      </div>
    </section>
  )
}
