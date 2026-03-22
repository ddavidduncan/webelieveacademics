import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow?: string
  heading: string | ReactNode
  body?: string | ReactNode
  align?: 'left' | 'center'
  light?: boolean   // true = white text (for dark backgrounds)
  className?: string
  headingClassName?: string
}

/**
 * Reusable section header: eyebrow tag → H2 → optional body paragraph.
 */
export default function SectionHeader({
  eyebrow,
  heading,
  body,
  align = 'center',
  light = false,
  className,
  headingClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4',
            light
              ? 'bg-white/15 text-white'
              : 'bg-teal-100 text-teal-600',
          )}
        >
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          'font-serif font-bold leading-tight mb-5',
          'text-3xl sm:text-4xl lg:text-[2.6rem]',
          light ? 'text-white' : 'text-blue-900',
          headingClassName,
        )}
      >
        {heading}
      </h2>

      {body && (
        <p
          className={cn(
            'text-lg leading-relaxed',
            light ? 'text-blue-100' : 'text-gray-500',
          )}
        >
          {body}
        </p>
      )}
    </div>
  )
}
