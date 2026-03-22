import SectionHeader from '@/components/ui/SectionHeader'
import AnimateIn from '@/components/ui/AnimateIn'

const testimonials = [
  {
    quote:
      'Our daughter went from dreading math to actually looking forward to her sessions. The personalized approach made all the difference — she finally feels seen.',
    name: 'Sarah M.',
    role: 'Parent of 4th grader',
    initials: 'SM',
  },
  {
    quote:
      'Finally, a program that truly sees my son as an individual. His confidence has completely transformed in just three months. The teacher they matched him with is extraordinary.',
    name: 'James R.',
    role: 'Parent of 8th grader',
    initials: 'JR',
  },
  {
    quote:
      'The combination of AI curriculum and a dedicated teacher is brilliant. We\'ve seen more progress in 2 months than in 2 years of traditional tutoring. Worth every penny.',
    name: 'Michelle T.',
    role: 'Homeschool parent',
    initials: 'MT',
  },
]

export default function Testimonials() {
  return (
    <section className="section-pad bg-blue-900">
      <div className="content-container">

        <AnimateIn>
          <SectionHeader
            eyebrow="What Families Are Saying"
            heading="Real Families. Real Results."
            body="Hear from parents who believed in their child — and found a partner who believed right alongside them."
            light
          />
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {testimonials.map(({ quote, name, role, initials }, i) => (
            <AnimateIn key={name} delay={i * 120}>
              <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-3xl p-8
                              hover:bg-white/12 transition-colors duration-300 h-full flex flex-col">
                {/* Large decorative quote mark */}
                <span className="font-serif text-6xl text-teal-400/30 leading-none mb-3
                                 select-none" aria-hidden>
                  &ldquo;
                </span>

                {/* Quote */}
                <blockquote className="text-blue-100 text-base leading-relaxed italic flex-1 mb-6">
                  {quote}
                </blockquote>

                {/* Attribution */}
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center
                                  justify-center text-white font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{name}</p>
                    <p className="text-blue-300 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-blue-400/60 text-xs mt-8">
          * Testimonials are representative examples. Individual results may vary.
        </p>
      </div>
    </section>
  )
}
