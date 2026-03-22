import { Brain, User, TrendingUp } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimateIn from '@/components/ui/AnimateIn'

const pillars = [
  {
    Icon: Brain,
    color: 'bg-teal-100 text-teal-600',
    title: 'AI-Powered Curriculum',
    body:
      'Our advanced AI instantly analyzes your child\'s unique strengths, challenges, and learning style — then builds a living, personalized curriculum that updates in real time as they grow.',
    badge: 'AI Precision',
  },
  {
    Icon: User,
    color: 'bg-blue-100 text-blue-700',
    title: 'Real Private Teacher Guidance',
    body:
      'A caring, expert teacher is hand-matched to your child\'s personality and learning needs — delivering warm one-on-one sessions that build real confidence, not just test scores.',
    badge: 'Human Heart',
  },
  {
    Icon: TrendingUp,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Measurable Progress & Growth',
    body:
      'Monthly reports and family portal access give you clear, real visibility into your child\'s journey — so you always know what\'s working and where they\'re headed.',
    badge: 'Extraordinary Results',
  },
]

export default function WhyWeBelieve() {
  return (
    <section className="section-pad bg-white">
      <div className="content-container">

        <AnimateIn>
          <SectionHeader
            eyebrow="The We Believe Difference"
            heading={
              <>The Perfect Blend of{' '}
                <span className="text-teal-600">AI Precision</span>
                {' '}+{' '}
                <span className="text-blue-900">Human Heart</span>
              </>
            }
            body="Most tutoring gives your child one hour of help and hopes for the best. We give them a complete, living learning experience that adapts, cares, and keeps going — every single day."
          />
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {pillars.map(({ Icon, color, title, body, badge }, i) => (
            <AnimateIn key={title} delay={i * 120}>
              <div className="card p-8 h-full flex flex-col group border-t-4 border-t-transparent
                              hover:border-t-teal-500">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5
                                 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                {/* Badge */}
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  {badge}
                </span>

                {/* Title */}
                <h3 className="font-serif font-bold text-blue-900 text-xl mb-3 leading-tight">
                  {title}
                </h3>

                {/* Body */}
                <p className="text-gray-500 text-base leading-relaxed flex-1">
                  {body}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
