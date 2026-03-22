'use client'

import { useState, FormEvent } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Contact / consultation request form.
 *
 * Uses Formspree for submission (free tier supports 50 submissions/month).
 * Setup:
 *   1. Go to https://formspree.io and create a free account.
 *   2. Click "New Form", give it a name (e.g. "WBA Consultation").
 *   3. Copy your Form ID (looks like "xpznkgvb").
 *   4. Add it to .env.local:  NEXT_PUBLIC_FORMSPREE_ID=xpznkgvb
 *   5. Done — submissions go straight to your email.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? 'YOUR_FORM_ID'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })

      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  /* ── Success state ── */
  if (status === 'success') {
    return (
      <div className="card p-10 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h3 className="font-serif font-bold text-blue-900 text-2xl">We got your message!</h3>
        <p className="text-gray-500 text-base max-w-sm">
          Thank you for reaching out. We&apos;ll be in touch within 24 hours to schedule your free
          consultation. We can&apos;t wait to hear more about your child.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 text-teal-600 font-semibold text-sm hover:underline"
        >
          Submit another inquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-5" noValidate>
      <h2 className="font-serif font-bold text-blue-900 text-2xl mb-1">
        Tell us about your child
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        Fill in as much or as little as you&apos;d like. We&apos;ll cover the rest in our call.
      </p>

      {/* Error banner */}
      {status === 'error' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>Something went wrong. Please try again or email us directly at
            {' '}<a href="mailto:hello@webelieveacademics.com"
                   className="font-semibold underline">hello@webelieveacademics.com</a>.
          </span>
        </div>
      )}

      {/* Parent / contact info */}
      <fieldset>
        <legend className="font-semibold text-blue-900 text-sm mb-4 uppercase tracking-wide">
          Your Information
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="name"  label="Your full name"  name="name"  type="text"  required />
          <Field id="email" label="Email address"   name="email" type="email" required />
          <Field id="phone" label="Phone (optional)" name="phone" type="tel" />
        </div>
      </fieldset>

      {/* Child info */}
      <fieldset>
        <legend className="font-semibold text-blue-900 text-sm mb-4 uppercase tracking-wide">
          About Your Child
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="child_name"  label="Child's name"   name="child_name"  type="text" />
          <Field id="child_age"   label="Child's age"    name="child_age"   type="text" />
          <Field id="grade_level" label="Grade level"    name="grade_level" type="text" placeholder="e.g. 7th grade" />
          <div className="sm:col-span-1">
            <label htmlFor="program_interest" className="block text-sm font-semibold text-blue-900 mb-1.5">
              Program interest
            </label>
            <select
              id="program_interest"
              name="program_interest"
              className="w-full border-1.5 border-gray-200 rounded-xl px-4 py-3 text-sm
                         text-gray-700 bg-white focus:outline-none focus:border-teal-500
                         focus:ring-2 focus:ring-teal-100 transition-all"
            >
              <option value="">Not sure yet</option>
              <option value="tutoring">Private 1:1 Tutoring</option>
              <option value="homeschool">Homeschool Curriculum</option>
              <option value="test_prep">Test Prep &amp; Acceleration</option>
              <option value="executive_function">Executive Function Coaching</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Goals */}
      <div>
        <label htmlFor="goals" className="block text-sm font-semibold text-blue-900 mb-1.5">
          What are your goals for your child? <span className="text-red-400">*</span>
        </label>
        <textarea
          id="goals"
          name="goals"
          rows={4}
          required
          placeholder="What do you want to see change? What does success look like for your family?"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                     text-gray-700 placeholder-gray-300 resize-none
                     focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100
                     transition-all"
        />
      </div>

      {/* Challenges */}
      <div>
        <label htmlFor="challenges" className="block text-sm font-semibold text-blue-900 mb-1.5">
          What&apos;s not working right now?
        </label>
        <textarea
          id="challenges"
          name="challenges"
          rows={3}
          placeholder="What are the struggles, frustrations, or gaps you're seeing?"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                     text-gray-700 placeholder-gray-300 resize-none
                     focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100
                     transition-all"
        />
      </div>

      {/* Honeypot spam field (hidden) */}
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} aria-hidden />

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full flex items-center justify-center gap-2
                   bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300
                   text-white font-bold text-base px-6 py-4 rounded-full
                   shadow-btn hover:shadow-btn-hover
                   transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
                   disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {status === 'submitting' ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Sending...
          </>
        ) : (
          <>
            Send — We&apos;ll Be in Touch Within 24 Hours
            <Send size={18} />
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        We respect your privacy. Your information is used only to contact you about your
        child&apos;s education.
      </p>
    </form>
  )
}

/* ── Reusable field ── */
function Field({
  id, label, name, type, required = false, placeholder,
}: {
  id: string; label: string; name: string; type: string;
  required?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-blue-900 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                   text-gray-700 placeholder-gray-300
                   focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100
                   transition-all"
      />
    </div>
  )
}
