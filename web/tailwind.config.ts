import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ── Brand colors (all drawn from the design system)
      // Note: teal-600 = #0D9488, blue-900 = #1E3A8A, emerald-500 = #10B981
      // are already in Tailwind's default palette. Only 'cream' is custom.
      colors: {
        cream: '#FEF3E8',
      },

      // ── Brand fonts (loaded via next/font in layout.tsx)
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'Times New Roman', 'serif'],
        sans:  ['var(--font-inter)',    'system-ui', 'sans-serif'],
      },

      // ── Scroll-triggered fade-up animation
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.65s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
      },

      // ── Generous spacing for premium feel
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '28': '7rem',
      },

      // ── Rounded card corners
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },

      // ── Subtle shadows with navy tint
      boxShadow: {
        'card':       '0 2px 16px rgba(30, 58, 138, 0.07)',
        'card-hover': '0 8px 32px rgba(30, 58, 138, 0.13)',
        'btn':        '0 6px 24px rgba(16, 185, 129, 0.30)',
        'btn-hover':  '0 10px 36px rgba(16, 185, 129, 0.40)',
      },
    },
  },
  plugins: [],
}

export default config
