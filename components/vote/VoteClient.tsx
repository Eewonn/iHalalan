'use client'

import { useState, useTransition, useEffect } from 'react'
import { validateToken, submitBallot } from '@/app/vote/[electionId]/actions'
import { ElectionWithNominees, BallotSelection, Nominee } from '@/lib/types'
import { cn } from '@/lib/utils'

const MAX_SELECTIONS = 15

type Step = 'token' | 'ballot' | 'confirm' | 'done'

// ── Civic status screens ──────────────────────────────────────────

function StatusScreen({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fdeee4] rounded-2xl mb-5">
        {icon}
      </div>
      <h2 className="font-display text-2xl font-semibold text-[#0a3d52] mb-2">{title}</h2>
      <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs mx-auto">{body}</p>
    </div>
  )
}

// ── Token Entry ───────────────────────────────────────────────────

function TokenEntry({
  election,
  onSuccess,
}: {
  election: { id: string; title: string; status: string }
  onSuccess: (token: string, ballot: ElectionWithNominees) => void
}) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = () => {
    const t = token.trim()
    if (!t) { setError('Please enter your access code'); return }
    setError('')
    startTransition(async () => {
      const result = await validateToken(election.id, t)
      if (result.error) { setError(result.error); return }
      if (result.ballot) onSuccess(t, result.ballot)
    })
  }

  if (election.status === 'closed') return (
    <StatusScreen
      icon={<svg className="w-8 h-8 text-[#a0522d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
      title="Voting has closed"
      body="The election period has ended. Results will be announced by the event organizer."
    />
  )

  if (election.status === 'setup') return (
    <StatusScreen
      icon={<svg className="w-8 h-8 text-[#a0522d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      title="Not yet open"
      body="Voting has not started. Check back once the organizer opens the ballot."
    />
  )

  return (
    <div className="flex flex-col items-center">
      <span className="badge-peach mb-6">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Boses ng Bayan
      </span>

      <div className="text-center mb-8 px-2">
        <h1 className="font-display text-4xl leading-snug font-medium text-[#1a1a1a]">
          Ang boto mo,<br />ang tinig mo sa{' '}
          <em className="italic text-[#0a3d52]">halalan.</em>
        </h1>
        <p className="text-[#6b7280] text-sm mt-4 leading-relaxed max-w-xs mx-auto">
          Ilagay ang iyong token para makapag-boto.
        </p>
      </div>

      <div className="card w-full p-5">
        <p className="section-label mb-2">PIN / Token</p>

        <div className="relative mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={token}
            onChange={(e) => { setToken(e.target.value.replace(/[^0-9]/g, '')); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="e.g. 123456"
            autoFocus
            className={cn(
              'w-full pl-4 pr-12 py-3.5 rounded-lg border text-[#1a1a1a] text-sm font-mono tracking-widest',
              'focus:outline-none focus:ring-2 focus:ring-[#0a3d52]/25 focus:border-[#0a3d52]',
              'placeholder:text-[#c0bdb8] placeholder:tracking-normal placeholder:font-sans',
              error ? 'border-[#c0392b] bg-red-50' : 'border-[#e4e2dd] bg-[#fafaf8]'
            )}
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0bdb8]">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[#c0392b] flex items-center gap-1.5 mb-3">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={pending || token.length < 6}
          className="btn-ink"
        >
          {pending ? 'Verifying…' : (
            <>
              Join Election
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-[#9ca3af] text-center flex items-center gap-1.5 mt-4">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        End-to-end encrypted participation
      </p>
    </div>
  )
}

// ── Candidate Card ────────────────────────────────────────────────

function CandidateCard({
  nominee, selected, rank, onClick,
}: { nominee: Nominee; selected: boolean; rank: number | null; onClick: () => void }) {
  const initials = nominee.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className={cn('candidate-card w-full text-left', selected && 'selected')}
    >
      <div
        className="w-full h-28 flex items-center justify-center relative overflow-hidden"
        style={{
          background: selected
            ? 'linear-gradient(135deg, #0a3d52 0%, #0f5672 100%)'
            : 'linear-gradient(135deg, #d4d2cc 0%, #bfbdb7 100%)',
        }}
      >
        <span className={cn('font-display text-4xl font-semibold', selected ? 'text-white/90' : 'text-white/70')}>
          {initials}
        </span>
        {selected && rank !== null && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[#0a3d52] text-xs font-bold">{rank}</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className={cn('font-semibold text-sm leading-snug', selected ? 'text-[#0a3d52]' : 'text-[#1a1a1a]')}>
          {nominee.name}
        </p>
        <p className="text-xs text-[#9ca3af] mt-0.5">{selected ? 'Selected' : 'Tap to select'}</p>
      </div>
    </button>
  )
}

// ── Ballot Form ───────────────────────────────────────────────────

function BallotForm({
  ballot,
  onConfirm,
}: {
  ballot: ElectionWithNominees
  onConfirm: (selections: BallotSelection[]) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const maxSelections = Math.min(MAX_SELECTIONS, ballot.nominees.length)
  const count = selected.size

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < maxSelections) {
        next.add(id)
      }
      return next
    })
  }

  const selectedOrder = [...selected]

  const handleConfirm = () => {
    onConfirm(selectedOrder.map((id) => ({ nominee_id: id })))
  }

  return (
    <div className="pb-32">
      <p className="section-label mb-1">General Election</p>
      <h2 className="font-display text-xl font-semibold text-[#0a3d52] mb-2">{ballot.title}</h2>
      <p className="text-sm text-[#6b7280] leading-relaxed mb-5">
        Select your top {maxSelections} candidates from the list below.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ballot.nominees.map((nominee) => {
          const isSelected = selected.has(nominee.id)
          const rank = isSelected ? selectedOrder.indexOf(nominee.id) + 1 : null
          return (
            <CandidateCard
              key={nominee.id}
              nominee={nominee}
              selected={isSelected}
              rank={rank}
              onClick={() => toggle(nominee.id)}
            />
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#f0efec] border-t border-[#e4e2dd] px-5 py-4 z-10">
        <div className="max-w-lg mx-auto space-y-2">
          {/* Selection counter */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6b7280]">
              <span className={cn('font-semibold', count === maxSelections ? 'text-[#0a3d52]' : 'text-[#1a1a1a]')}>{count}</span>
              <span className="text-[#9ca3af]"> / {maxSelections} selected</span>
            </span>
            {count > 0 && count < maxSelections && (
              <span className="text-xs text-[#9ca3af]">{maxSelections - count} more to go</span>
            )}
          </div>
          <button
            onClick={handleConfirm}
            disabled={count < maxSelections}
            className="btn-ink"
          >
            {count < maxSelections ? (
              `Select ${maxSelections - count} more`
            ) : (
              <>
                Review Ballot
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Confirmation ──────────────────────────────────────────────────

function ConfirmationScreen({
  ballot, selections, onBack, onSubmit,
}: {
  ballot: ElectionWithNominees
  selections: BallotSelection[]
  onBack: () => void
  onSubmit: () => void
}) {
  const [pending, startTransition] = useTransition()
  const nomineeMap = ballot.nominees.reduce<Record<string, string>>((acc, n) => {
    acc[n.id] = n.name
    return acc
  }, {})

  return (
    <div className="pb-28">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#0a3d52] mb-5 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Edit ballot
      </button>

      <p className="section-label mb-1">Review Your Ballot</p>
      <h2 className="font-display text-xl font-semibold text-[#0a3d52] mb-2">Confirm Your Selections</h2>
      <p className="text-sm text-[#6b7280] mb-5">Check your choices carefully. Submissions are final and cannot be changed.</p>

      <div className="card divide-y divide-[#f0efec] mb-6">
        {selections.map((sel, idx) => (
          <div key={sel.nominee_id} className="px-5 py-3.5 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#e8f0f4] text-[#0a3d52] text-xs font-bold flex items-center justify-center flex-shrink-0">
              {idx + 1}
            </span>
            <span className="font-semibold text-[#0a3d52] text-sm">{nomineeMap[sel.nominee_id]}</span>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#f0efec] border-t border-[#e4e2dd] px-5 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => startTransition(async () => onSubmit())}
            disabled={pending}
            className="btn-ink"
          >
            {pending ? 'Submitting…' : (
              <>
                Submit Ballot
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Success ───────────────────────────────────────────────────────

function SuccessScreen({ title }: { title: string }) {
  useEffect(() => {
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min
    import('canvas-confetti').then(({ default: confetti }) => {
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }
      const interval = setInterval(() => {
        confetti({ ...defaults, particleCount: 40, colors: ['#f5a878', '#0a3d52', '#0f5672', '#fdeee4'], origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount: 40, colors: ['#f5a878', '#0a3d52', '#0f5672', '#fdeee4'], origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 280)
      setTimeout(() => clearInterval(interval), 3000)
    })
  }, [])

  return (
    <div className="flex flex-col items-center text-center pt-8 pb-6">
      <div className="w-20 h-20 bg-[#fdeee4] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <div className="w-11 h-11 bg-[#1a1a1a] rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="font-display text-4xl font-semibold text-[#0a3d52] leading-tight mb-4">
        Vote Submitted<br />Successfully!
      </h2>

      <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs mb-8">
        Salamat sa iyong pakikilahok sa {title}. Ang iyong boto ay ligtas na naitala.
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'iHalalan', text: `I just voted in ${title}!` }).catch(() => {})
            }
          }}
          className="btn-ink"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share the Experience
        </button>
        <button className="btn-ghost">Done</button>
      </div>

      <div className="mt-8 w-full border-t border-[#e4e2dd] pt-6">
        <p className="section-label mb-3">Live Dashboard</p>
        <div className="card p-4 text-left">
          <p className="text-sm text-[#6b7280]">
            Results will be visible once the organizer closes voting. Check back after the election period ends.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────

export default function VoteClient({
  election,
}: {
  election: { id: string; title: string; status: string }
}) {
  const [step, setStep] = useState<Step>('token')
  const [token, setToken] = useState('')
  const [ballot, setBallot] = useState<ElectionWithNominees | null>(null)
  const [selections, setSelections] = useState<BallotSelection[]>([])
  const [submitError, setSubmitError] = useState('')

  return (
    <div>
      {submitError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#c0392b] flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {submitError}
        </div>
      )}

      {step === 'token' && (
        <TokenEntry
          election={election}
          onSuccess={(t, b) => { setToken(t); setBallot(b); setStep('ballot') }}
        />
      )}
      {step === 'ballot' && ballot && (
        <BallotForm
          ballot={ballot}
          onConfirm={(sel) => { setSelections(sel); setStep('confirm') }}
        />
      )}
      {step === 'confirm' && ballot && (
        <ConfirmationScreen
          ballot={ballot}
          selections={selections}
          onBack={() => setStep('ballot')}
          onSubmit={async () => {
            setSubmitError('')
            const result = await submitBallot(token, selections)
            if (result.error) { setSubmitError(result.error); return }
            setStep('done')
          }}
        />
      )}
      {step === 'done' && <SuccessScreen title={election.title} />}
    </div>
  )
}
