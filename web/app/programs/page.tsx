import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Home, FileText, Brain, CheckCircle2, ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimateIn     from '@/components/ui/AnimateIn'
import FooterCTA     from '@/components/home/FooterCTA'

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Personalized programs that fit your family — private tutoring, homeschool curriculum, test prep, and executive function coaching, all powered by AI and delivered by caring teachers.',
}

const programs = [
  {
    Icon: BookOpen,
    badge: '1:1 Core Support',
    title: 'Private 1:1 Tutoring',
    subtitle: 'K–12 & Beyond',
    body: 'Daily or weekly sessions tailored exactly to your child\'s needs — homework help, skill mastery, or enrichment with a teacher who truly knows and cares about them.',
    bullets: [
      'Every subject, every grade — personalized to how your child actually learns',
      'A dedicated teacher who explains with patience, celebrates progress, and adjusts in real time',
      'Perfect for students who need consistency, encouragement, and someone in their corner',
      'Flexible scheduling — in-home, online, or hybrid, nationwide',
    ],
    accent: 'border-t-teal-500',
    iconBg: 'bg-teal-100 text-teal-600',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    Icon: Home,
    badge: 'Full Pathway',
    title: 'Full Customized Homeschool Curriculum',
    subtitle: 'Complete K–12 Program',
    body: 'A complete, accredited program built by AI and guided by your child\'s private teacher — fully flexible, family-friendly, and designed around your child\'s unique path.',
    bullets: [
      'Full curriculum across all subjects, sequenced to your child\'s own pace',
      'Real structure and accountability without the rigidity of traditional school',
      'Teacher guidance plus family visibility into every step of the journey',
      'Lives and breathes — the curriculum updates as your child grows',
    ],
    accent: 'border-t-blue-500',
    iconBg: 'bg-blue-100 text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    Icon: FileText,
    badge: 'Advanced Outcomes',
    title: 'Test Prep & Academic Acceleration',
    subtitle: 'SAT · ACT · AP · Advanced Coursework',
    body: 'AI-driven practice and real teacher strategy sessions that build both skill and confidence — for ambitious students, high-stakes deadlines, or anyone ready to push further.',
    bullets: [
      'Targeted preparation focused on your child\'s specific weak points and real strengths',
      'Data-informed practice paired with a teacher who builds genuine test-day confidence',
      'Score improvement strategies that go beyond memorization',
      'Great for AP students, college-bound juniors, and high achievers who want more',
    ],
    accent: 'border-t-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    Icon: Brain,
    badge: 'Habits + Confidence',
    title: 'Executive Function & Study Skills Coaching',
    subtitle: 'Focus · Organization · Confidence',
    body: 'Help with focus, organization, time management, and confidence — for students who need more than content help. Sometimes the issue isn\'t what they\'re learning, but how they\'re approaching it.',
    bullets: [
      'Support for getting started, following through, and building routines that last',
      'Workload and time management strategies that actually stick',
      'Real confidence-building for students with ADHD, anxiety, or learning differences',
      'Works beautifully alongside tutoring or homeschool programs',
    ],
    accent: 'border-t-violet-500',
    iconBg: 'bg-violet-100 text-violet-600',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
]

export default function ProgramsPage() {
  return (
    <>
      {/* ── Page Hero ── */}
      <section className="hero-bg py-24 lg:py-32">
        <div className="content-container max-w-3xl">
          <span className="eyebrow">Programs</span>
          <h1 className="font-serif font-extrabold text-blue-900 text-4xl sm:text-5xl
                         lg:text-[3.2rem] leading-tight mb-6">
            Personalized Programs<br className="hidden sm:block" />
            That Fit Your Family.
          </h1>
          <p className="text-gray-600 text-xl leading-relaxed max-w-2xl">
            Every program starts with your child — their strengths, their challenges, and what makes
            them light up. Then we build around that with AI-powered planning and a caring private
            teacher who makes it real.
          </p>
        </div>
      </section>

      {/* ── Program cards ── */}
      <section className="section-pad bg-white">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {programs.map(({ Icon, badge, title, subtitle, body, bullets, accent, iconBg, badgeColor }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className={`card p-8 h-full flex flex-col border-t-4 ${accent}`}>
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center
                                     justify-center flex-shrink-0`}>
                      <Icon size={22} strokeWidth={1.8} />
                    </div>
                    <div>
                      <span className={`text-xs font-semibold uppercase tracking-widest
                                        px-2.5 py-1 rounded-full ${badgeColor}`}>
                        {badge}
                      </span>
                      <h2 className="font-serif font-bold text-blue-900 text-xl leading-tight mt-2">
                        {title}
                      </h2>
                      <p className="text-teal-600 text-xs font-semibold mt-0.5">{subtitle}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <p className="text-gray-500 text-base leading-relaxed mb-6">{body}</p>

                  {/* Bullets */}
                  <ul className="space-y-3 flex-1">
                    {bullets.map(b => (
                      <li key={b} className="flex items-start gap-3 text-sm text-gray-600">
                        <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/contact"
                    className="mt-7 inline-flex items-center gap-2 text-teal-600 font-bold
                               text-sm hover:text-teal-700 transition-colors group"
                  >
                    Get started with this program
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consistency strip ── */}
      <section className="section-pad cream-section">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">

            <AnimateIn>
              <div className="card p-8 h-full">
                <SectionHeader
                  eyebrow="What Stays True"
                  heading="Across Every Program"
                  align="left"
                  className="max-w-none mb-7"
                />
                <ul className="space-y-4">
                  {[
                    'Your child\'s plan is built around them — not a template, not a textbook.',
                    'A caring teacher who coaches, explains, motivates, and adapts in the moment.',
                    'Real progress you can see — not vague updates, but genuine measurable growth.',
                    'Flexibility to change, grow, or shift programs as your child\'s needs evolve.',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle2 size={18} className="text-teal-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateIn>

            <AnimateIn delay={150}>
              <div className="bg-blue-900 rounded-3xl p-8 h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-4">
                    This Is a Great Fit If Your Child Needs
                  </p>
                  <h3 className="font-serif font-bold text-white text-2xl leading-snug mb-4">
                    Someone who believes in them — and a plan actually built around how they learn.
                  </h3>
                  <p className="text-blue-200 text-base leading-relaxed">
                    Not sure which program is right? That&apos;s exactly what the free consultation
                    is for. Tell us about your child and we&apos;ll recommend the best path —
                    no pressure, no obligation.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600
                             text-white font-bold px-6 py-3.5 rounded-full shadow-btn
                             transition-all duration-200 hover:-translate-y-0.5 self-start"
                >
                  Book a Free Consultation
                  <ArrowRight size={16} />
                </Link>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <FooterCTA />
    </>
  )
}
