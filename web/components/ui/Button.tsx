import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  // Green CTA — primary action
  primary:
    'bg-emerald-500 hover:bg-emerald-600 text-white shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0',

  // Teal — secondary action
  secondary:
    'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',

  // Ghost / outlined — less prominent
  outline:
    'bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white hover:-translate-y-0.5',

  // Ghost white (for dark backgrounds)
  ghost:
    'bg-white/10 border-2 border-white/50 text-white hover:bg-white/20 hover:border-white hover:-translate-y-0.5',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3.5',
}

export default function Button({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 font-bold rounded-full',
    'transition-all duration-200 cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className,
  )

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  )
}
