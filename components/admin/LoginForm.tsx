'use client'

import { useActionState } from 'react'
import { cn } from '@/lib/utils'

type ActionFn = (formData: FormData) => Promise<{ error: string } | void>

export default function LoginForm({ action }: { action: ActionFn }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await action(formData)
      return result ?? null
    },
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      {/* Label */}
      <p className="section-label mb-2">PIN / Token</p>

      {/* Input */}
      <div className="relative">
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Enter your PIN"
          required
          className={cn(
            'w-full pl-4 pr-12 py-3.5 rounded-lg border text-[#1a1a1a] text-sm',
            'focus:outline-none focus:ring-2 focus:ring-[#0a3d52]/30 focus:border-[#0a3d52]',
            'placeholder:text-[#c0bdb8]',
            state?.error
              ? 'border-[#c0392b] bg-red-50'
              : 'border-[#e4e2dd] bg-[#fafaf8]'
          )}
        />
        {/* Key icon */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0bdb8]">
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-[#c0392b] flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-ink flex items-center justify-center gap-2 mt-2">
        {isPending ? 'Verifying…' : (
          <>
            Access Control Center
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}
