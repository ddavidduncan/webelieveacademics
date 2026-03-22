import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react'

const navLinks = [
  { href: '/',             label: 'Home' },
  { href: '/about',        label: 'About Us' },
  { href: '/programs',     label: 'Programs' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/contact',      label: 'Contact' },
]

const programs = [
  { href: '/programs', label: 'Private 1:1 Tutoring' },
  { href: '/programs', label: 'Homeschool Curriculum' },
  { href: '/programs', label: 'Test Prep & Acceleration' },
  { href: '/programs', label: 'Executive Function Coaching' },
]

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white">

      {/* ── Main footer grid ── */}
      <div className="content-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                <img src="/logo.svg" alt="" width={40} height={40} className="w-full h-full" />
              </div>
              <span className="font-serif font-bold text-white text-base leading-tight">
                We Believe<br />Academics
              </span>
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed mb-5">
              The perfect blend of AI precision + human heart. We believe every child has
              unlimited potential — and we built something to prove it.
            </p>
            {/* Social icons (placeholder hrefs) */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook,  label: 'Facebook',  href: '#' },
                { Icon: Instagram, label: 'Instagram', href: '#' },
                { Icon: Linkedin,  label: 'LinkedIn',  href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-blue-800 hover:bg-teal-600 flex items-center
                             justify-center transition-colors duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-widest mb-5">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-blue-200 hover:text-teal-400 text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Programs */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-widest mb-5">
              Programs
            </h3>
            <ul className="space-y-3">
              {programs.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-blue-200 hover:text-teal-400 text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-widest mb-5">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:hello@webelieveacademics.com"
                  className="text-blue-200 hover:text-teal-400 text-sm transition-colors"
                >
                  hello@webelieveacademics.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+15555550100"
                  className="text-blue-200 hover:text-teal-400 text-sm transition-colors"
                >
                  (555) 555-0100
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
                <span className="text-blue-200 text-sm">
                  Serving families nationwide<br />
                  In-home · Online · Hybrid
                </span>
              </li>
            </ul>

            {/* Footer CTA */}
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center bg-emerald-500 hover:bg-emerald-600
                         text-white text-sm font-bold px-5 py-2.5 rounded-full
                         transition-all duration-200 hover:-translate-y-0.5"
            >
              Free Consultation →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-blue-800">
        <div className="content-container py-5 flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-xs text-blue-400">
          <p>© {new Date().getFullYear()} We Believe Academics. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/contact" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-teal-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
