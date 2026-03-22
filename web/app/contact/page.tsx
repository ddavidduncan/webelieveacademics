import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react'
import ContactForm from '@/components/contact/ContactForm'
import AnimateIn   from '@/components/ui/AnimateIn'

export const metadata: Metadata = {
  title: 'Schedule Your Free Consultation',
  description:
    'Schedule your free consultation with We Believe Academics. Tell us about your child and your goals — we\'ll reach out within 24 hours with a personalized recommendation.',
}

export default function ContactPage() {
  return (
    <>
      {/* ── Page Hero ── */}
      <section className="hero-bg py-24 lg:py-28">
        <div className="content-container max-w-3xl">
          <span className="eyebrow">Let&apos;s Talk About Your Child</span>
          <h1 className="font-serif font-extrabold text-blue-900 text-4xl sm:text-5xl
                         lg:text-[3.2rem] leading-tight mb-6">
            Schedule Your<br className="hidden sm:block" /> Free Consultation.
          </h1>
          <p className="text-gray-600 text-xl leading-relaxed max-w-2xl">
            Tell us about your child and your goals — we&apos;ll reach out within 24 hours to set up
            a no-obligation call and build a personalized recommendation just for your family.
          </p>
        </div>
      </section>

      {/* ── Form + side info ── */}
      <section className="section-pad bg-white">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14 items-start">

            {/* Left: what to expect + contact info */}
            <AnimateIn className="space-y-7">

              {/* What to expect */}
              <div className="card p-7">
                <span className="eyebrow">What to Expect</span>
                <h2 className="font-serif font-bold text-blue-900 text-xl leading-tight mb-4">
                  A real conversation about your child.
                </h2>
                <ul className="space-y-4">
                  {[
                    'We listen to your child\'s story — strengths, struggles, and what makes them unique.',
                    'We help identify what\'s really going on and what kind of support would make the biggest difference.',
                    'We explain how our AI + teacher approach would work specifically for your child.',
                    'No pressure, no hard sell — even if you\'re still deciding, we\'ll give you useful guidance.',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-900 text-base">Reach Us Directly</h3>
                {[
                  {
                    Icon: Mail,
                    label: 'Email',
                    value: 'hello@webelieveacademics.com',
                    href: 'mailto:hello@webelieveacademics.com',
                  },
                  {
                    Icon: Phone,
                    label: 'Phone',
                    value: '(555) 555-0100',
                    href: 'tel:+15555550100',
                  },
                  {
                    Icon: MapPin,
                    label: 'Coverage',
                    value: 'Serving families nationwide',
                    href: undefined,
                  },
                  {
                    Icon: Clock,
                    label: 'Response time',
                    value: 'Within 24 hours, always',
                    href: undefined,
                  },
                ].map(({ Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center
                                    flex-shrink-0">
                      <Icon size={16} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {label}
                      </p>
                      {href ? (
                        <a href={href} className="text-blue-900 font-semibold text-sm
                                                  hover:text-teal-600 transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-blue-900 font-semibold text-sm">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reassurance callout */}
              <div className="bg-cream rounded-2xl p-5 border border-amber-100">
                <p className="font-serif font-semibold text-blue-900 text-base leading-snug mb-2">
                  &ldquo;Every family that reaches out gets a thoughtful, personalized response —
                  never a template.&rdquo;
                </p>
                <p className="text-gray-500 text-sm">— The We Believe Academics Team</p>
              </div>
            </AnimateIn>

            {/* Right: the form */}
            <AnimateIn delay={150}>
              <ContactForm />
            </AnimateIn>
          </div>
        </div>
      </section>
    </>
  )
}
