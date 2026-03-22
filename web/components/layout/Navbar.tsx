'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/',             label: 'Home' },
  { href: '/about',        label: 'About Us' },
  { href: '/programs',     label: 'Programs' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/contact',      label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  /* Add shadow when user scrolls down */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close mobile menu on route change */
  useEffect(() => setMobileOpen(false), [pathname])

  /* Prevent body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-shadow duration-300',
          scrolled ? 'shadow-md' : 'border-b border-gray-100',
        )}
      >
        <nav className="content-container flex items-center justify-between h-18 gap-8">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="We Believe Academics — Home"
          >
            {/* Brand mark */}
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
              <img
                src="/logo.svg"
                alt="We Believe Academics logo mark"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Brand name */}
            <span className="font-serif font-bold text-teal-600 text-lg leading-tight hidden sm:block group-hover:text-teal-700 transition-colors">
              We Believe<br className="hidden lg:block" />
              <span className="lg:hidden"> </span>Academics
            </span>
          </Link>

          {/* ── Desktop navigation links ── */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const active =
                href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'relative px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200',
                      active
                        ? 'text-teal-600'
                        : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50',
                    )}
                  >
                    {label}
                    {/* Active underline indicator */}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-teal-600 rounded-full" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* ── Desktop CTA + mobile hamburger ── */}
          <div className="flex items-center gap-3">
            {/* Portal link (subtle) */}
            <Link
              href="/contact"
              className="hidden md:inline-block text-xs font-semibold text-gray-400 hover:text-teal-600 transition-colors"
            >
              Parent Login
            </Link>

            {/* Primary CTA */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600
                         text-white text-sm font-bold px-5 py-2.5 rounded-full
                         shadow-btn hover:shadow-btn-hover
                         transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Free Consultation
            </Link>

            {/* Hamburger (mobile only) */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile full-screen menu ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-white flex flex-col lg:hidden transition-all duration-300',
          mobileOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-4',
        )}
        style={{ top: '72px' }}
      >
        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => {
              const active =
                href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center px-4 py-4 rounded-xl text-lg font-semibold transition-colors',
                      active
                        ? 'text-teal-600 bg-teal-50'
                        : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50',
                    )}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Mobile CTA */}
          <Link
            href="/contact"
            className="mt-8 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600
                       text-white text-base font-bold px-6 py-4 rounded-full
                       shadow-btn transition-all duration-200"
          >
            Schedule Your Free Consultation
          </Link>

          <p className="mt-4 text-center text-sm text-gray-400">
            No obligation · Nationwide · K–12
          </p>
        </nav>
      </div>
    </>
  )
}
