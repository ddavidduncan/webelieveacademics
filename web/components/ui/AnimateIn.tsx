'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimateInProps {
  children: ReactNode
  className?: string
  /** Delay in ms before the animation starts (for staggered grids) */
  delay?: number
  /** Intersection threshold — how much of the element must be visible */
  threshold?: number
}

/**
 * Wraps children in a div that fades up when it enters the viewport.
 * Uses IntersectionObserver — no layout shift, no JS animation loops.
 */
export default function AnimateIn({
  children,
  className,
  delay = 0,
  threshold = 0.12,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={cn('animate-in-element', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
