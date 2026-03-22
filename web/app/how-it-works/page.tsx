import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MessageCircle, Sparkles, Users, BookOpen, BarChart2, ArrowRight
} from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimateIn     from '@/components/ui/AnimateIn'
import FooterCTA     from '@/components/home/FooterCTA'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Simple. Personalized. Life-changing. See how We Believe Academics creates a customized learning experience for your child in five clear steps.',
}

const steps = [
  {
    n: '01',
    Icon: MessageCircle,
    title: 'Free Consultation',
    headline: 'We listen to your goals and your child\'s story.',
    body: 'No pressure. No sales pitch. Just a real conversation about what your child needs to thrive — their strengths, their struggles, and what success looks like for your family.',
    color: 'bg-teal-600',
    iconBg: 'bg-teal-100 text-teal-600',
  },
  {
    n: '02',
    Icon: Sparkles,
    title: 'AI Curriculum Build',
    headline: 'Our technology creates a unique learning plan in minutes.',
    body: 'Our AI analyzes everything we\'ve learned about your child and instantly builds a living, personalized curriculum — sequenced to their exact strengths, learning style, and goals. Not a template. A plan built for them alone.',
    color: 'bg-blue-700',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    n: '03',
    Icon: Users,
    title: 'Teacher Matching',
    headline: 'We hand-match you with an amazing private teacher.',
    body: 'We carefully select a teacher who fits your child\'s personality, communication style, and learning needs — someone who genuinely cares and knows how to build trust with your child.',
    color: 'bg-violet-600',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    n: '04',
    Icon: BookOpen,
    title: 'Learning Begins',
    headline: 'Weekly sessions — in-home, online, or hybrid.',
    body: 'Your child\'s teacher delivers sessions with patience, warmth, and the AI-powered plan as their guide — adjusting in real time, celebrating every win, and keeping your child engaged and excited to learn.',
    color: 'bg-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    n: '05',
    Icon: BarChart2,
    title: 'Ongoing Progress',
    headline: 'Monthly reports + adjustments so your child keeps thriving.',
    body: 'Regular progress reports give your family clear visibility. The AI updates the curriculum as your child grows. Your teacher adapts their approach. This isn\'t a static program — it moves with your child, always.',
    color: 'bg-rose-600',
    iconBg: 'bg-rose-100 text-rose-600',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* ── Page Hero ── */}
      <section className="hero-bg py-24 lg:py-32">
        <div className="content-container max-w-3xl">
          <span className="eyebrow">How It Works</span>
          <h1 className="font-serif font-extrabold text-blue-900 text-4xl sm:text-5xl
                         lg:text-[3.2rem] leading-tight mb-6">
            Simple. Personalized.<br className="hidden sm:block" /> Life-Changing.
          </h1>
          <p className="text-gray-600 text-xl leading-relaxed max-w-2xl">
            Getting started is easy. We listen to your family, learn about your child, and build
            something truly personalized — then walk alongside you every step of the way.
          </p>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="section-pad bg-white">
        <div className="content-container max-w-4xl">
          <div className="space-y-8">
            {steps.map(({ n, Icon, title, headline, body, color, iconBg }, i) => (
              <AnimateIn key={n} delay={i * 80}>
                <div className="card p-8 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">

                  {/* Left: number + icon */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3">
                    <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center
                                     justify-center font-bold text-sm flex-shrink-0 shadow-md`}>
                      {n}
                    </div>
                    <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center
                                     justify-center flex-shrink-0 hidden sm:flex`}>
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                  </div>

                  {/* Right: content */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                      Step {n}
                    </p>
                    <h2 className="font-serif font-bold text-blue-900 text-2xl leading-tight mb-2">
                      {title}
                    </h2>
                    <p className="text-teal-600 font-semibold text-base mb-3 leading-snug">
                      {headline}
                    </p>
                    <p className="text-gray-500 text-base leading-relaxed">{body}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>

          {/* CTA after steps */}
          <AnimateIn className="text-center mt-14">
            <p className="text-gray-500 text-lg mb-6 max-w-xl mx-auto">
              Ready to see what this looks like for your child? Start with a free consultation —
              we&apos;ll listen and show you exactly how it works.
            </p>
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

      {/* ── Why families love this ── */}
      <section className="section-pad cream-section">
        <div className="content-container">
          <AnimateIn>
            <SectionHeader
              eyebrow="Why Families Love This"
              heading="A Clear Path from Struggle to Thriving."
            />
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { n: '1', text: 'There\'s a clear, caring path from "we need help" to "my child is thriving."' },
              { n: '2', text: 'Someone who knows your child owns the relationship and the next steps.' },
              { n: '3', text: 'You can see real progress — no more guessing if things are getting better.' },
              { n: '4', text: 'Support can grow or change without starting over from scratch.' },
            ].map(({ n, text }, i) => (
              <AnimateIn key={n} delay={i * 80}>
                <div className="card p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-900 text-white font-bold text-sm
                                  flex items-center justify-center mx-auto mb-4">{n}</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <FooterCTA />
    </>
  )
}
