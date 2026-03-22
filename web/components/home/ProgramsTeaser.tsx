import Link from 'next/link'
import { BookOpen, Home, FileText, Brain, ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimateIn from '@/components/ui/AnimateIn'

const programs = [
  {
    Icon: BookOpen,
    label: '1:1 Core Support',
    title: 'Private 1:1 Tutoring',
    subtitle: 'K–12 & Beyond',
    body: 'Daily or weekly sessions tailored exactly to your child\'s needs — homework help, skill mastery, or enrichment with a teacher who truly knows and cares about them.',
    accent: 'border-l-teal-500',
    iconBg: 'bg-teal-100 text-teal-600',
  },
  {
    Icon: Home,
    label: 'Full Pathway',
    title: 'Customized Homeschool Curriculum',
    subtitle: 'Complete K–12 Program',
    body: 'A complete, flexible curriculum built by AI and guided by your child\'s private teacher — structured enough to trust, flexible enough for your family\'s life.',
    accent: 'border-l-blue-500',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    Icon: FileText,
    label: 'Advanced Outcomes',
    title: 'Test Prep & Academic Acceleration',
    subtitle: 'SAT · ACT · AP · Advanced',
    body: 'AI-driven practice and real teacher strategy sessions that build both skill and confidence — for ambitious students and high-stakes deadlines.',
    accent: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    Icon: Brain,
    label: 'Habits + Confidence',
    title: 'Executive Function Coaching',
    subtitle: 'Focus · Organization · Confidence',
    body: 'Help with focus, organization, time management, and confidence — combining smart AI tools with real human mentoring for lasting change.',
    accent: 'border-l-violet-500',
    iconBg: 'bg-violet-100 text-violet-600',
  },
]

export default function ProgramsTeaser() {
  return (
    <section className="section-pad cream-section">
      <div className="content-container">

        <AnimateIn className="flex flex-col sm:flex-row items-start sm:items-end
                              justify-between gap-6 mb-14">
          <SectionHeader
            eyebrow="Programs"
            heading="Personalized Programs That Fit Your Family"
            body="Every program starts with your child — their strengths, challenges, and what makes them light up."
            align="left"
            className="max-w-xl"
          />
          <Link
            href="/programs"
            className="flex-shrink-0 inline-flex items-center gap-2 text-teal-600 font-bold
                       text-sm hover:text-teal-700 transition-colors group"
          >
            See all programs
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {programs.map(({ Icon, label, title, subtitle, body, accent, iconBg }, i) => (
            <AnimateIn key={title} delay={i * 100}>
              <Link href="/programs" className="card p-7 flex flex-col h-full border-l-4
                                               group cursor-pointer block no-underline
                                               ${accent}">
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center
                                 justify-center mb-4 group-hover:scale-110
                                 transition-transform duration-300`}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  {label}
                </span>
                <h3 className="font-serif font-bold text-blue-900 text-lg leading-tight mb-1">
                  {title}
                </h3>
                <p className="text-teal-600 text-xs font-semibold mb-3">{subtitle}</p>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{body}</p>
                <span className="mt-4 text-teal-600 text-sm font-bold flex items-center gap-1
                                 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={14} />
                </span>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
