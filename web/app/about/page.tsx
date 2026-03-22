import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Heart, Lightbulb, Eye } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimateIn     from '@/components/ui/AnimateIn'
import FooterCTA     from '@/components/home/FooterCTA'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'We believe every student is brilliant — they just need the right environment to shine. Learn how We Believe Academics combines AI-powered curriculum with caring private teachers.',
}

const values = [
  {
    Icon: Heart,
    color: 'bg-rose-100 text-rose-600',
    title: 'Every Child Is Unique',
    body: 'We treat your child\'s learning style, personality, interests, goals, and struggles as the starting point — not an afterthought. The curriculum is built entirely around them.',
  },
  {
    Icon: Lightbulb,
    color: 'bg-amber-100 text-amber-600',
    title: 'Technology Serves the Human Relationship',
    body: 'AI helps us understand your child faster and plan smarter. But the magic happens with their teacher — the person who shows up, listens, explains with patience, and celebrates every breakthrough.',
  },
  {
    Icon: Eye,
    color: 'bg-teal-100 text-teal-600',
    title: 'Families Deserve Real Visibility',
    body: 'You shouldn\'t have to guess whether things are working. We give you clear visibility into your child\'s progress, their plan, and exactly where they\'re headed.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ── Page Hero ── */}
      <section className="hero-bg py-24 lg:py-32">
        <div className="content-container max-w-4xl">
          <span className="eyebrow">About Us</span>
          <h1 className="font-serif font-extrabold text-blue-900 text-4xl sm:text-5xl
                         lg:text-[3.2rem] leading-tight mb-6">
            We Believe Academics —<br className="hidden sm:block" />
            And We Believe in Your Child.
          </h1>
          <p className="text-gray-600 text-xl leading-relaxed max-w-2xl">
            We believe every student is brilliant — they just need the right environment to shine.
            Traditional classrooms and generic tutoring programs can&apos;t keep up with how uniquely
            each child learns. That&apos;s why we created something different.
          </p>
        </div>
      </section>

      {/* ── Story section ── */}
      <section className="section-pad bg-white">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            <AnimateIn>
              <span className="eyebrow">Why This Company Exists</span>
              <h2 className="font-serif font-bold text-blue-900 text-3xl lg:text-4xl
                             leading-tight mb-6">
                Built for the student who deserves more.
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Too many bright kids are stuck in systems that don&apos;t see them. They get lost
                  in crowded classrooms, bored by one-size-fits-all programs, or frustrated by
                  tutoring that treats symptoms instead of understanding the whole child.
                </p>
                <p>
                  We combine cutting-edge AI technology with compassionate, highly qualified private
                  teachers. Our AI analyzes learning patterns, interests, and progress in real time
                  to curate a completely customized curriculum. Your child&apos;s dedicated teacher
                  then delivers personalized instruction, builds confidence, and provides the human
                  connection that sparks true engagement and lasting growth.
                </p>
                <p className="font-semibold text-blue-900">
                  No two students get the same experience — because no two students are the same.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn delay={150}>
              {/* What we believe callout */}
              <div className="bg-cream rounded-3xl p-8 border border-amber-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  What We Believe
                </p>
                <blockquote className="font-serif font-bold text-blue-900 text-2xl leading-snug mb-5">
                  &ldquo;Every student is brilliant — they just need someone who sees it
                  and builds around it.&rdquo;
                </blockquote>
                <p className="text-gray-500 text-base">
                  That&apos;s not a tagline. It&apos;s the conviction behind every curriculum we build
                  and every teacher we match.
                </p>
              </div>

              {/* AI + Teacher split */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="card p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">
                    What AI Does
                  </p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex gap-2"><span className="text-teal-500">✦</span> Builds the curriculum in minutes</li>
                    <li className="flex gap-2"><span className="text-teal-500">✦</span> Tracks patterns in real time</li>
                    <li className="flex gap-2"><span className="text-teal-500">✦</span> Adapts as your child grows</li>
                  </ul>
                </div>
                <div className="card p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-2">
                    What Teachers Do
                  </p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex gap-2"><span className="text-blue-400">✦</span> See the whole child</li>
                    <li className="flex gap-2"><span className="text-blue-400">✦</span> Build real confidence</li>
                    <li className="flex gap-2"><span className="text-blue-400">✦</span> Make learning human</li>
                  </ul>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Core beliefs ── */}
      <section className="section-pad cream-section">
        <div className="content-container">
          <AnimateIn>
            <SectionHeader
              eyebrow="Core Beliefs"
              heading="What Guides Everything We Do"
            />
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {values.map(({ Icon, color, title, body }, i) => (
              <AnimateIn key={title} delay={i * 120}>
                <div className="card p-7 h-full">
                  <div className={`w-12 h-12 rounded-2xl ${color} flex items-center
                                   justify-center mb-5`}>
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-serif font-bold text-blue-900 text-xl mb-3 leading-tight">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-base leading-relaxed">{body}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform reality band ── */}
      <section className="section-pad bg-blue-900">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateIn>
              <SectionHeader
                eyebrow="More Than a Website"
                heading="This Is More Than a Tutoring Company."
                body="We're building a complete personalized education experience — from the moment you reach out, through onboarding, into your child's daily learning, and all the way to the progress reports that show you it's working. The family portal is live. The platform is real. And it's built around your child."
                align="left"
                light
                className="max-w-none"
              />
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600
                           text-white font-bold px-7 py-4 rounded-full shadow-btn
                           transition-all duration-200 hover:-translate-y-0.5"
              >
                Schedule Your Free Consultation
                <ArrowRight size={18} />
              </Link>
            </AnimateIn>

            <AnimateIn delay={150}>
              <div className="bg-white/8 border border-white/10 rounded-3xl p-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-5">
                  What&apos;s Live Now
                </p>
                <ul className="space-y-4">
                  {[
                    'Family registration and secure parent accounts',
                    'Student profiles linked to your family',
                    'Progress visibility and learning dashboards',
                    'AI-powered curriculum planning ready to go',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-blue-100">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-400/30
                                       flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#2DD4BF" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <FooterCTA />
    </>
  )
}
